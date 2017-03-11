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

    function shallowDeepAlmostEqual(expect, actual, path) {

        var treshhold = 0.001;

        // null value
        if (expect === null) {
            if (! (actual === null)) {
              throw 'Expected to have null but got "' + actual +'" at path "'+ path +'".';
            }

            return true;
        }

        // undefined expected value
        if (typeof expect == 'undefined') {
            if (typeof actual != 'undefined') {
              throw 'Expected to have undefined but got "' + actual +'" at path "'+ path +'".';
            }

            return true;
        }

        // scalar description
        if (/boolean|string/.test(typeof expect)) {
            if (expect != actual) {
                throw 'Expected to have "' + expect +'" but got "'+ actual +'" at path "'+ path +'".';
            }

            return true;
        }

        // numbers — here is some important 'almost equal' stuff
        // TODO: configurable treshhold
        if (typeof expect == 'number') {
            if (typeof actual != 'number') {
              throw 'Expected to have number but got "' + actual +'" at path "'+ path +'".';
            }
            if (Math.abs(expect - actual) > treshhold) {
                throw 'Expected to have "' + expect +'+-0.001" but got "'+ actual +'" at path "'+ path +'".';
            }

            return true;
        }

        // dates
        if (expect instanceof Date) {
            if (actual instanceof Date) {
                if (expect.getTime() != actual.getTime()) {
                    throw(
                        'Expected to have date "' + expect.toISOString() + '" but got ' +
                        '"' + actual.toISOString() + '" at path "' + path + '".'
                    );
                }

            } else {
                throw(
                    'Expected to have date "' + expect.toISOString() + '" but got ' +
                    '"' + actual + '" at path "' + path + '".'
                );
            }
        }

        if (actual === null) {
            throw 'Expected to have an array/object but got null at path "' + path + '".';
        }

        // array/object description
        for (var prop in expect) {
            if (typeof actual[prop] == 'undefined' && typeof expect[prop] != 'undefined') {
                throw 'Expected "' + prop + '" field to be defined at path "' + path +  '".';
            }

            shallowDeepAlmostEqual(expect[prop], actual[prop], path + (path == '/' ? '' : '/') + prop);
        }

        return true;
    }

    chai.Assertion.addMethod('shallowDeepAlmostEqual', function (expect) {
        try {
            shallowDeepAlmostEqual(expect, this._obj, '/');
        }
        catch (msg) {
            this.assert(false, msg, undefined, expect, this._obj);
        }
    });

    chai.assert.shallowDeepAlmostEqual = function(val, exp, msg) {
        new chai.Assertion(val, msg).to.be.shallowDeepAlmostEqual(exp);
    }

}));
