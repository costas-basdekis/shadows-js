describe("PolarPoint", function () {
    describe("constructor", function () {
        it("Should have angle and distance", function () {
            const point = new PolarPoint(Math.PI, 5);

            expect(point.angle).to.equal(Math.PI);
            expect(point.length).to.equal(5);
        });
    });

    describe("Angle", function () {
        it("Angle is almost the same as taken from cos/sin", function () {
            const step = Math.PI / 6;
            const length = 5;

            const zeroAngles = range(-Math.PI, Math.PI, step);
            const halfStepAngles = range(-Math.PI + step / 2, Math.PI, step);
            const angles = zeroAngles.concat(halfStepAngles);
            expect(angles.length).to.equal(12 + 11);
            for(const angle of angles) {
                const cartesianPoint = new CartesianPoint(
                    Math.cos(angle) * length, Math.sin(angle) * length);
                const polarPoint = PolarPoint.fromCartesianPoint(cartesianPoint);
                expect(polarPoint.angle).to.shallowDeepAlmostEqual(angle);
            }
        });
    });

    describe("Length", function () {
        it("Length is almost the same as taken from cos/sin", function () {
            const step = Math.PI / 6;
            const length = 5;

            const zeroAngles = range(-Math.PI, Math.PI, step);
            const halfStepAngles = range(-Math.PI + step / 2, Math.PI, step);
            const angles = zeroAngles.concat(halfStepAngles);
            expect(angles.length).to.equal(12 + 11);
            for(const angle of angles) {
                const cartesianPoint = new CartesianPoint(
                    Math.cos(angle) * length, Math.sin(angle) * length);
                const polarPoint = PolarPoint.fromCartesianPoint(cartesianPoint);
                expect(polarPoint.length).to.shallowDeepAlmostEqual(length);
            }
        });
    });
});
