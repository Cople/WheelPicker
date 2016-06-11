"use strict";

require("./WheelPicker.scss");

var utils = require("./utils.js");
var Wheel = require("./Wheel.js");

function WheelPicker(options) {
    this.options = utils.extend({
        data: [],
        rows: 5,
        rowHeight: 34,
        parseValue: function(value) {
            return value.join(" ");
        }
    }, options);

    if (this.options.el) {
        this.input = typeof this.options.el === "string" ? document.querySelector(this.options.el) : this.options.el;
        this.input.setAttribute("readonly", true);
    }

    this.value = [];
    this.wheels = [];

    this.closed = true;
    this.disabled = false;

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

WheelPicker.prototype = {
    _init: function() {
        this._createDom();

        for (var i = 0, len = this.options.data.length; i < len; i++) {
            this.wheels.push(new Wheel(this.wheelsContainer, {
                rows: this.options.rows,
                rowHeight: this.options.rowHeight,
                data: this.options.data[i],
                value: this.options.value ? this.options.value[i] : null,
                onSelect: this._onChange.bind(this, i)
            }));
        }

        if (this.options.title) this.container.querySelector(".wheelpicker-title").innerHTML = this.options.title;
        this.container.querySelector(".wheelpicker-mask-top").style.height = this.container.querySelector(".wheelpicker-mask-btm").style.height = this.options.rowHeight * Math.floor(this.options.rows / 2) - 1 + "px";

        this._bindEvents();
        this._set(true);
    },

    _createDom: function() {
        this.container = document.createElement("div");
        this.container.className = "wheelpicker";
        if (this.options.id) this.container.id = "wheelpicker-" + this.options.id;
        this.container.innerHTML = "<div class='wheelpicker-backdrop'></div><div class='wheelpicker-panel'><div class='wheelpicker-actions'><button type='button' class='cancel'>取消</button><button type='button' class='set'>确定</button><h4 class='wheelpicker-title'></h4></div><div class='wheelpicker-main'><div class='wheelpicker-wheels'></div><div class='wheelpicker-mask wheelpicker-mask-top'></div><div class='wheelpicker-mask wheelpicker-mask-current'></div><div class='wheelpicker-mask wheelpicker-mask-btm'></div></div></div>";
        this.wheelsContainer = this.container.querySelector(".wheelpicker-wheels");

        if (this.options.onRender) this.options.onRender.call(this, this.container);

        document.body.appendChild(this.container);
    },

    _bindEvents: function() {
        if (this.input) this.input.addEventListener("focus", this.show.bind(this));
        if (this.options.hideOnBackdrop) this.container.querySelector(".wheelpicker-backdrop").addEventListener("click", this._cancel.bind(this));

        this.container.querySelector(".wheelpicker-actions .cancel").addEventListener("click", this._cancel.bind(this));
        this.container.querySelector(".wheelpicker-actions .set").addEventListener("click", this._set.bind(this));

        this.container.querySelector(".wheelpicker-backdrop").addEventListener(this.transitionendName, this._backdropTransEnd.bind(this));
    },

    _onChange: function(index, value) {
        if (this.options.onChange) this.options.onChange.call(this, value.value, index);
    },

    _backdropTransEnd: function() {
        if (!this.container.classList.contains("show")) {
            this.container.style.display = "none";
            this.closed = true;

            if (this.restore) {
                this.wheels.forEach(function(wheel, idx) {
                    wheel.setData(this._tempData[idx]);
                }, this);
            }
            this.setVal(this.value, null);
        }
    },

    _set: function(silent) {
        this.value = this.getVal();
        if (this.input) {
            this.input.value = this.options.parseValue(this.value);
        }
        if (silent === true) return;
        if (this.options.onSelect) this.options.onSelect.call(this, this.getVal());
        this.container.classList.remove("show");
    },

    _cancel: function() {
        if (this.changed) {
            this.restore = true;
        }
        if (this.options.onCancel) this.options.onCancel.call(this);
        this.container.classList.remove("show");
    },

    show: function() {
        if (this.disabled || !this.closed) return;

        var container = this.container;

        this.closed = this.changed = this.restore = false;
        this._tempData = this.getData();

        container.style.display = "block";
        setTimeout(function() {
            container.classList.add("show");
        }, 10);

        if (this.options.onShow) this.options.onShow.call(this);
    },

    hide: function() {
        if (this.disabled || this.closed) return;

        this._cancel();
    },

    getVal: function(index) {
        if (typeof index === "number") {
            return this.wheels[index].getVal();
        } else {
            return this.wheels.map(function(wheel) {
                return wheel.getVal();
            });
        }
    },

    setVal: function(value, index) {
        if (this.disabled) return;

        var noAnimation = this.closed;

        if (typeof index === "number") {
            this.wheels[index].setVal(value, noAnimation);
        } else {
            this.wheels.forEach(function(wheel, idx) {
                wheel.setVal(value[idx], noAnimation);
            });
        }

        if (this.closed) this._set(true);
    },

    getData: function(index) {
        if (typeof index == "number") {
            return this.wheels[index].getData();
        } else {
            return this.wheels.map(function(wheel) {
                return wheel.getData();
            });
        }
    },

    setData: function(data, index, value) {
        if (this.disabled) return;
        this.changed = true;

        if (typeof index == "number") {
            this.wheels[index].setData(data, value);
        } else {
            if (utils.isArray(index)) value = index;

            this.wheels.forEach(function(wheel, idx) {
                wheel.setData(data[idx], value ? value[idx] : null);
            });
        }

        if (this.closed) this._set(true);
    },

    enable: function() {
        this.disabled = false;
    },

    disable: function() {
        this.disabled = true;
    },

    destory: function() {
        this.disable();
        this.container.parentNode.removeChild(this.container);
        if (this.input) this.input.removeAttribute("readonly");
    }
};

module.exports = WheelPicker;
