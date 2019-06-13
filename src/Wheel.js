"use strict";

var utils = require("./utils.js");

function Wheel(el, options) {
    this.container = typeof el === "string" ? document.querySelector(el) : el;

    this.data = [];
    this.items = [];

    this.y = 0;
    this.selectedIndex = 0;

    this.isTransition = false;
    this.isTouching = false;

    this.easings = {
        scroll: "cubic-bezier(0.23, 1, 0.32, 1)", // easeOutQuint
        scrollBounce: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", // easeOutQuard
        bounce: "cubic-bezier(0.165, 0.84, 0.44, 1)" // easeOutQuart
    };

    this.options = utils.extend({
        data: [],
        rows: 5,
        rowHeight: 34,
        adjustTime: 400,
        bounceTime: 600,
        momentumThresholdTime: 300,
        momentumThresholdDistance: 10
    }, options);

    if (this.options.rows % 2 === 0) this.options.rows++;

    this.pointerEvents = "ontouchstart" in window ? {
        start: "touchstart",
        move: "touchmove",
        end: "touchend",
        cancel: "touchcancel"
    } : {
        start: "mousedown",
        move: "mousemove",
        end: "mouseup",
        cancel: "mouseleave"
    };

    this.transformName = utils.prefixed("transform");
    this.transitionName = utils.prefixed("transition");
    this.transitionendName = {
        WebkitTransition: "webkitTransitionEnd",
        MozTransition: "transitionEnd",
        msTransition: "MSTransitionEnd",
        OTransition: "oTransitionEnd",
        transition: "transitionend"
    }[this.transitionName];

    this._init();
}

Wheel.prototype = {
    _init: function() {
        this._createDOM();
        this._bindEvents();
    },

    _createDOM: function() {
        this.wheel = document.createElement("div");
        this.wheel.className = "wheelpicker-wheel";

        this.scroller = document.createElement("ul");
        this.scroller.className = "wheelpicker-wheel-scroller";

        this.setData(this.options.data, this.options.value);

        this.wheel.style.height = this.options.rowHeight * this.options.rows + "px";
        this.scroller.style.marginTop = this.options.rowHeight * Math.floor(this.options.rows / 2) + "px";

        this.wheelHeight = this.wheel.offsetHeight;

        this.wheel.appendChild(this.scroller);
        this.container.appendChild(this.wheel);
    },

    _momentum: function(current, start, time, lowerMargin, wheelSize, deceleration, rowHeight) {
        var distance = current - start;
        var speed = Math.abs(distance) / time;
        var destination;
        var duration;

        deceleration = deceleration === undefined ? 0.0006 : deceleration;

        destination = current + (speed * speed) / (2 * deceleration) * (distance < 0 ? -1 : 1);
        duration = speed / deceleration;

        destination = Math.round(destination / rowHeight) * rowHeight;

        if (destination < lowerMargin) {
            destination = wheelSize ? lowerMargin - (wheelSize / 2.5 * (speed / 8)) : lowerMargin;
            distance = Math.abs(destination - current);
            duration = distance / speed;
        } else if (destination > 0) {
            destination = wheelSize ? wheelSize / 2.5 * (speed / 8) : 0;
            distance = Math.abs(current) + destination;
            duration = distance / speed;
        }

        return {
            destination: Math.round(destination),
            duration: duration
        };
    },

    _resetPosition: function(duration) {
        var y = this.y;

        duration = duration || 0;

        if (y > 0) y = 0;
        if (y < this.maxScrollY) y = this.maxScrollY;

        if (y === this.y) return false;

        this._scrollTo(y, duration, this.easings.bounce);

        return true;
    },

    _getClosestSelectablePosition: function(y) {
        var index = Math.abs(Math.round(y / this.options.rowHeight));

        if (!this.data[index].disabled) return y;

        var max = Math.max(index, this.data.length - index);
        for (var i = 1; i <= max; i++) {
            if (!this.data[index + i].disabled) {
                index += i;
                break;
            }
            if (!this.data[index - i].disabled) {
                index -= i;
                break;
            }
        }
        return index * -this.options.rowHeight;
    },

    _scrollTo: function(y, duration, easing) {
        if (this.y === y) {
            this._scrollFinish();
            return false;
        }

        this.y = this._getClosestSelectablePosition(y);
        this.scroller.style[this.transformName] = "translate3d(0," + this.y + "px,0)";

        if (duration && duration > 0) {
            this.isTransition = true;
            this.scroller.style[this.transitionName] = duration + "ms " + easing;
        } else {
            this._scrollFinish();
        }
    },

    _scrollFinish: function() {
        var newIndex = Math.abs(this.y / this.options.rowHeight);
        if (this.selectedIndex != newIndex) {
            this.items[this.selectedIndex].classList.remove("wheelpicker-item-selected");
            this.items[newIndex].classList.add("wheelpicker-item-selected");
            this.selectedIndex = newIndex;
            if (this.options.onSelect) this.options.onSelect(this.data[newIndex], newIndex);
        }
    },

    _getCurrentY: function() {
        var matrixValues = utils.getStyle(this.scroller, this.transformName).match(/-?\d+(\.\d+)?/g);
        return parseInt(matrixValues[matrixValues.length - 1]);
    },

    _start: function(event) {
        event.preventDefault();

        if (!this.data.length) return;

        if (this.isTransition) {
            this.isTransition = false;
            this.y = this._getCurrentY();
            this.scroller.style[this.transformName] = "translate3d(0," + this.y + "px,0)";
            this.scroller.style[this.transitionName] = "";
        }

        this.startY = this.y;
        this.lastY = event.touches ? event.touches[0].pageY : event.pageY;
        this.startTime = Date.now();

        this.isTouching = true;
    },

    _move: function(event) {
        if (!this.isTouching) return false;

        var y = event.changedTouches ? event.changedTouches[0].pageY : event.pageY;
        var deltaY = y - this.lastY;
        var targetY = this.y + deltaY;
        var now = Date.now();

        this.lastY = y;

        if (targetY > 0 || targetY < this.maxScrollY) {
            targetY = this.y + deltaY / 3;
        }

        this.y = Math.round(targetY);

        this.scroller.style[this.transformName] = "translate3d(0," + this.y + "px,0)";

        if (now - this.startTime > this.momentumThresholdTime) {
            this.startTime = now;
            this.startY = this.y;
        }

        return false;
    },

    _end: function(event) {
        if (!this.isTouching) return false;

        var deltaTime = Date.now() - this.startTime;
        var duration = this.options.adjustTime;
        var easing = this.easings.scroll;
        var distanceY = Math.abs(this.y - this.startY);
        var momentumVals;
        var y;

        this.isTouching = false;

        if (deltaTime < this.options.momentumThresholdTime && distanceY <= 10 && event.target.classList.contains("wheelpicker-item")) {
            this._scrollTo(event.target._wsIdx * -this.options.rowHeight, duration, easing);
            return false;
        }

        if (this._resetPosition(this.options.bounceTime)) return;

        if (deltaTime < this.options.momentumThresholdTime && distanceY > this.options.momentumThresholdDistance) {
            momentumVals = this._momentum(this.y, this.startY, deltaTime, this.maxScrollY, this.wheelHeight, 0.0007, this.options.rowHeight);
            y = momentumVals.destination;
            duration = momentumVals.duration;
        } else {
            y = Math.round(this.y / this.options.rowHeight) * this.options.rowHeight;
        }

        if (y > 0 || y < this.maxScrollY) {
            easing = this.easings.scrollBounce;
        }

        this._scrollTo(y, duration, easing);
    },

    _transitionEnd: function() {
        this.isTransition = false;
        this.scroller.style[this.transitionName] = "";

        if (!this._resetPosition(this.options.bounceTime)) this._scrollFinish();
    },

    _bindEvents: function() {
        this.wheel.addEventListener(this.pointerEvents.start, this._start.bind(this));
        this.wheel.addEventListener(this.pointerEvents.move, this._move.bind(this));
        this.wheel.addEventListener(this.pointerEvents.end, this._end.bind(this));
        this.wheel.addEventListener(this.pointerEvents.cancel, this._end.bind(this));
        this.scroller.addEventListener(this.transitionendName, this._transitionEnd.bind(this));
    },

    getData: function() {
        return this.data;
    },

    setData: function(data, value) {
        var defaultValue = value || (data && data.length ? (data[0].value || data[0]) : null);

        this.items = [];
        this.scroller.innerHTML = "";

        this.data = data.map(function(item, idx) {
            var li = document.createElement("li");

            li.className = "wheelpicker-item";

            item = typeof item === "object" ? item : {
                text: item,
                value: item
            };

            if (item.disabled) li.className += " wheelpicker-item-disabled";
            if (item.value === defaultValue) {
                li.className += " wheelpicker-item-selected";
                this.selectedIndex = idx;
            }
            li._wsIdx = idx;
            li.innerHTML = item.text;

            this.items.push(li);
            this.scroller.appendChild(li);

            return item;
        }, this);

        this.y = this.selectedIndex * -this.options.rowHeight;
        this.scroller.style[this.transformName] = "translate3d(0," + this.y + "px,0)";
        this.maxScrollY = -this.options.rowHeight * (this.data.length - 1);
    },

    getSelectedItem: function() {
        return this.data[this.selectedIndex];
    },

    getValue: function() {
        var selected = this.getSelectedItem();
        return selected ? selected.value : null;
    },

    setValue: function(value, noAnimation) {
        var index;
        var item;

        for (var i = 0, len = this.data.length; i < len; i++) {
            item = this.data[i];

            if (item.value === value) {
                if (!item.disabled) index = i;
                break;
            }
        }

        if (index >= 0) {
            this._scrollTo(index * -this.options.rowHeight, noAnimation ? 0 : this.options.adjustTime, this.easings.scroll);
        }

        return index;
    }
};

module.exports = Wheel;
