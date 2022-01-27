const { expect } = require("chai");
const { range } = require("../src/utils");
const { CartesianPoint } = require("../src/CartesianPoint");
const { PolarPoint } = require("../src/PolarPoint");


describe("PolarPoint", function () {
    describe("constructor", function () {
        it("Should have angle and distance", function () {
            const point = new PolarPoint(Math.PI, 5);

            expect(point.angle).to.equal(Math.PI);
            expect(point.length).to.equal(5);
        });
    });

    describe("Angle", function () {
        const step = Math.PI / 6;
        const length = 5;

        const zeroAngles = range(-Math.PI, Math.PI, step);
        const halfStepAngles = range(-Math.PI + step / 2, Math.PI, step);
        const angles = zeroAngles.concat(halfStepAngles);

        it("Has 24 angles to test with", function () {
            expect(angles.length).to.equal(12 + 12);
        });

        it("Angle is almost the same as taken from cos/sin", function () {
            for(const angle of angles) {
                const cartesianPoint = new CartesianPoint(
                    Math.cos(angle) * length, Math.sin(angle) * length);
                const polarPoint = PolarPoint.fromCartesianPoint(cartesianPoint);
                expect(polarPoint.angle).to.shallowDeepAlmostEqual(
                    PolarPoint.normaliseAngle(angle));
            }
        });
    });

    describe("#normaliseAngle", function () {
        it("Is normalised in (-PI, PI]", function () {
            const angles = range(-5 * Math.PI, 5 * Math.PI, Math.PI / 6);
            for (const angle of angles) {
                const normalised = PolarPoint.normaliseAngle(angle);
                expect(normalised).to.be.at.most(Math.PI);
                expect(normalised).to.be.above(-Math.PI);
            }
        });

        it("Difference is multiple of 2 * PI", function () {
            const angles = range(-5 * Math.PI, 5 * Math.PI, Math.PI / 6);
            for (const angle of angles) {
                const normalised = PolarPoint.normaliseAngle(angle);
                const diff = normalised - angle;
                const diffPIs = diff / (2 * Math.PI);
                const roundedDiffPis = Math.round(diffPIs);
                expect(roundedDiffPis).to.shallowDeepAlmostEqual(diffPIs);
            }
        });
    });

    describe("Length", function () {
        const step = Math.PI / 6;
        const length = 5;

        const zeroAngles = range(-Math.PI, Math.PI, step);
        const halfStepAngles = range(-Math.PI + step / 2, Math.PI, step);
        const angles = zeroAngles.concat(halfStepAngles);

        it("Has 24 angles to test with", function () {
            expect(angles.length).to.equal(12 + 12);
        });

        it("Length is almost the same as taken from cos/sin", function () {
            for(const angle of angles) {
                const cartesianPoint = new CartesianPoint(
                    Math.cos(angle) * length, Math.sin(angle) * length);
                const polarPoint = PolarPoint.fromCartesianPoint(cartesianPoint);
                expect(polarPoint.length).to.shallowDeepAlmostEqual(length);
            }
        });
    });
});
