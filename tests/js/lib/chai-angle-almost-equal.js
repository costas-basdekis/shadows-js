"use strict";

(function (plugin) {
    if (
        typeof require === "function" &&
        typeof exports === "object" &&
        typeof module === "object"
    ) {
        // NodeJS
        module.exports = plugin;
    } else if (
        typeof define === "function" &&
        define.amd
    ) {
        // AMD
        define(function () {
            return plugin;
        });
    } else {
        // Other environment (usually <script> tag): plug in to global chai instance directly.
        chai.use(plugin);
    }
}(function (chai, utils) {
    const { angleAlmostEquals } = require("../../../js/utils");

    function angleAlmostEqual(expect, actual, precision=angleAlmostEquals.defaultPrecision) {
        if (angleAlmostEquals(expect, actual, precision)) {
            return true;
        }

        let diff = Math.abs(expect - actual);
        while (diff >= Math.PI - precision) {
            diff -= Math.PI;
        }

        throw `${expect} !~= ${actual} (diff=${diff}, e=${precision})`;
    }

    chai.Assertion.addMethod('angleAlmostEquals', function (expect, precision=angleAlmostEquals.defaultPrecision) {
        try {
            angleAlmostEqual(expect, this._obj, precision);
        }
        catch (msg) {
            this.assert(false, msg, undefined, expect, this._obj);
        }
    });

    chai.assert.angleAlmostEquals = function(val, exp, msg, precision=angleAlmostEquals.defaultPrecision) {
        new chai.Assertion(val, msg).to.be.angleAlmostEquals(exp, precision);
    }
}));
