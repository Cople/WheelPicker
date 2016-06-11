"use strict";

module.exports = {
    extend: Object.assign || function(target, source) {
        for (var key in source) {
            if (source.hasOwnProperty(key)) target[key] = source[key];
        }
        return target;
    },
    prefixed: function(prop) {
        var style = document.createElement("div").style;
        var vendors = ["Webkit", "Moz", "ms", "O"];
        var name;

        if (prop in style) return prop;

        for (var i = 0, len = vendors.length; i < len; i++) {
            name = vendors[i] + prop.charAt(0).toUpperCase() + prop.substring(1);
            if (name in style) return name;
        }

        return null;
    },
    getStyle: function(el, prop) {
        prop = prop.replace(/([A-Z])/g, "-$1");
        prop = prop.toLowerCase();
        return window.getComputedStyle(el, null).getPropertyValue(prop);
    },
    isArray: Array.isArray || function(obj) {
        return Object.prototype.toString.call(obj) === "[object Array]";
    }
};
