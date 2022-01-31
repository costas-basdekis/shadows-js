import { angleAlmostEquals } from "../../src";
import AssertionPrototype = Chai.AssertionPrototype;

export default function angleAlmostEqualPlugin(chai: any) {
    function angleAlmostEqual(expect: number, actual: number, precision: number = angleAlmostEquals.defaultPrecision) {
        if (angleAlmostEquals(expect, actual, precision)) {
            return true;
        }

        let diff = Math.abs(expect - actual);
        while (diff >= Math.PI - precision) {
            diff -= Math.PI;
        }

        throw `${expect} !~= ${actual} (diff=${diff}, e=${precision})`;
    }

    chai.Assertion.addMethod('angleAlmostEquals', function (this: AssertionPrototype, expect: number, precision: number = angleAlmostEquals.defaultPrecision) {
        try {
            angleAlmostEqual(expect, this._obj, precision);
        } catch (msg) {
            this.assert(false, `${msg}`, "", expect, this._obj);
        }
    });

    chai.assert.angleAlmostEquals = function (val: number, exp: number, msg: string | undefined, precision: number = angleAlmostEquals.defaultPrecision) {
        new chai.Assertion(val, msg).to.be.angleAlmostEquals(exp, precision);
    }
}
