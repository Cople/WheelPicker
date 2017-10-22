"use strict";

require("./WheelPicker.scss");

var utils = require("./utils.js");
var Wheel = require("./Wheel.js");

function WheelPicker(options) {
    this.options = utils.extend({
        data: [],
        rows: 5,
        rowHeight: 34,
        hiddenInput: false,
        parseValue: function(value) {
            return value.split(" ");
        },
        formatValue: function(value) {
            return value.join(" ");
        },
        formatHiddenValue: function(value) {
            return value.join(" ");
        }
    }, options);

    if (this.options.el) {
        var el = typeof this.options.el === "string" ? document.querySelector(this.options.el) : this.options.el;
        el.readOnly = true;

        if (this.options.hiddenInput) {
            var dummyInput = el.cloneNode();
            dummyInput.classList.add("wheelpicker-control");
            dummyInput.removeAttribute("id");
            dummyInput.removeAttribute("name");
            this.control = dummyInput;
            this.elType = el.type;
            el.type = "hidden";
            el.classList.add("wheelpicker-hiddeninput");
            el.parentNode.insertBefore(this.control, el);
            this.hiddenInput = el;
        } else {
            el.classList.add("wheelpicker-control");
            this.control = el;
        }

        this.origEl = el;
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
        var defaultValue = this.options.value || (this.control && this.control.value ? this.options.parseValue(this.control.value) : null);

        this._createDOM();

        for (var i = 0, len = this.options.data.length; i < len; i++) {
            this.wheels.push(new Wheel(this.wheelsContainer, {
                rows: this.options.rows,
                rowHeight: this.options.rowHeight,
                data: this.options.data[i],
                value: defaultValue ? defaultValue[i] : null,
                onSelect: this._onChange.bind(this, i)
            }));
        }

        if (this.options.title) this.container.querySelector(".wheelpicker-title").innerHTML = this.options.title;
        this.container.querySelector(".wheelpicker-mask-top").style.height = this.container.querySelector(".wheelpicker-mask-btm").style.height = this.options.rowHeight * Math.floor(this.options.rows / 2) - 1 + "px";

        this._bindEvents();
        if (defaultValue) this._set(true);
    },

    _createDOM: function() {
        this.container = document.createElement("div");
        this.container.className = "wheelpicker";
        if (this.origEl) this.container.id = "wheelpicker-" + (this.origEl.name || this.origEl.id);
        this.container.innerHTML = "<div class='wheelpicker-backdrop'></div><div class='wheelpicker-panel'><div class='wheelpicker-actions'><button type='button' class='btn-cancel'>取消</button><button type='button' class='btn-set'>确定</button><h4 class='wheelpicker-title'></h4></div><div class='wheelpicker-main'><div class='wheelpicker-wheels'></div><div class='wheelpicker-mask wheelpicker-mask-top'></div><div class='wheelpicker-mask wheelpicker-mask-current'></div><div class='wheelpicker-mask wheelpicker-mask-btm'></div></div></div>";
        this.wheelsContainer = this.container.querySelector(".wheelpicker-wheels");

        if (this.options.onRender) this.options.onRender.call(this, this.container);

        document.body.appendChild(this.container);
    },

    _bindEvents: function() {
        this._onFocus = function(event) {
            event.target.blur();
            this.show();
        }.bind(this);

        if (this.control) this.control.addEventListener("focus", this._onFocus);
        if (this.options.hideOnBackdrop) this.container.querySelector(".wheelpicker-backdrop").addEventListener("click", this._cancel.bind(this));

        this.container.querySelector(".wheelpicker-actions .btn-cancel").addEventListener("click", this._cancel.bind(this));
        this.container.querySelector(".wheelpicker-actions .btn-set").addEventListener("click", this._set.bind(this));

        this.container.querySelector(".wheelpicker-backdrop").addEventListener(this.transitionendName, this._backdropTransEnd.bind(this));
    },

    _onChange: function(index) {
        if (this.options.onChange) this.options.onChange.call(this, index, this.getSelectedItems()[index]);
    },

    _backdropTransEnd: function() {
        if (!this.container.classList.contains("shown")) {
            this.container.style.display = "none";
            this.closed = true;

            if (this.restore) {
                this.wheels.forEach(function(wheel, idx) {
                    wheel.setData(this._tempData[idx]);
                }, this);
            }
            this.setValue(this.value);
        }
    },

    _set: function(silent) {
        var selectedItems = this.getSelectedItems();
        this.value = this.getValue();
        if (this.control && !this.cancelled) {
            this.control.value = this.options.formatValue(selectedItems.map(function(item) {
                return item ? item.text : null;
            }));
            if (this.hiddenInput) {
                this.hiddenInput.value = this.options.formatHiddenValue(selectedItems.map(function(item) {
                    return item ? item.value : null;
                }));
            }
        }
        this.cancelled = false;
        if (silent === true) return;
        if (this.options.onSelect) this.options.onSelect.call(this, selectedItems);
        this.container.classList.remove("shown");
    },

    _cancel: function() {
        this.cancelled = true;
        if (this.changed) {
            this.restore = true;
        }
        if (this.options.onCancel) this.options.onCancel.call(this);
        this.container.classList.remove("shown");
    },

    show: function() {
        if (this.disabled || !this.closed) return;

        var container = this.container;

        this.closed = this.changed = this.restore = false;
        this._tempData = this.getData();

        container.style.display = "block";
        setTimeout(function() {
            container.classList.add("shown");
        }, 10);

        if (this.options.onShow) this.options.onShow.call(this);
    },

    hide: function() {
        if (this.disabled || this.closed) return;

        this._cancel();
    },

    getSelectedItems: function() {
        return this.wheels.map(function(wheel) {
            return wheel.getSelectedItem();
        });
    },

    getValue: function(index) {
        if (typeof index === "number") {
            return this.wheels[index].getValue();
        } else {
            return this.wheels.map(function(wheel) {
                return wheel.getValue();
            });
        }
    },

    setValue: function(value, index) {
        if (this.disabled) return;

        var noAnimation = this.closed;

        if (typeof index === "number") {
            this.wheels[index].setValue(value, noAnimation);
        } else {
            this.wheels.forEach(function(wheel, idx) {
                wheel.setValue(value[idx], noAnimation);
            });
        }

        if (this.closed) this._set(true);
    },

    getData: function(index) {
        if (typeof index === "number") {
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

        if (typeof index === "number") {
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

        if (this.hiddenInput) {
            this.control.parentNode.removeChild(this.control);
            this.hiddenInput.readOnly = false;
            this.hiddenInput.type = this.elType;
            this.hiddenInput.classList.remove("wheelpicker-hiddeninput");
        } else if (this.control) {
            this.control.readOnly = false;
            this.control.removeEventListener("focus", this._onFocus);
            this.control.classList.remove("wheelpicker-control");
        }
    }
};

module.exports = WheelPicker;
