describe("CartesianPoint", function() {
    describe("constructor", function() {
        it("Should have x and y", function() {
            const point = new CartesianPoint(10, 10);
            expect(point.x).to.equal(10);
            expect(point.y).to.equal(10);
        });
    });

    describe("#length", function () {
        it("Is 5 inside either quadrant", function () {
            const x = 3, y = 4;

            expect(new CartesianPoint(x, y).length()).to.equal(5);
            expect(new CartesianPoint(-x, y).length()).to.equal(5);
            expect(new CartesianPoint(x, -y).length()).to.equal(5);
            expect(new CartesianPoint(-x, -y).length()).to.equal(5);

            expect(new CartesianPoint(y, x).length()).to.equal(5);
            expect(new CartesianPoint(-y, x).length()).to.equal(5);
            expect(new CartesianPoint(y, -x).length()).to.equal(5);
            expect(new CartesianPoint(-y, -x).length()).to.equal(5);
        });

        it("Is 5 on any axis", function () {
            expect(new CartesianPoint(0, 5).length()).to.equal(5);
            expect(new CartesianPoint(0, -5).length()).to.equal(5);
            expect(new CartesianPoint(5, 0).length()).to.equal(5);
            expect(new CartesianPoint(-5, 0).length()).to.equal(5);
        });
    });

    describe("#angle", function () {
        it("Angle is almost the same as taken from cos/sin", function () {
            const step = Math.PI / 6;
            const length = 5;

            const zeroAngles = range(-Math.PI, Math.PI, step);
            const halfStepAngles = range(-Math.PI + step / 2, Math.PI, step);
            const angles = zeroAngles.concat(halfStepAngles);
            expect(angles.length).to.equal(12 + 11);
            for(const angle of angles) {
                const point = new CartesianPoint(
                    Math.cos(angle) * length, Math.sin(angle) * length);
                const pointAngle = point.angle();
                expect(pointAngle).to.shallowDeepAlmostEqual(angle);
            }
        });
    });

    describe("#length", function () {
        it("Length is almost the same as taken from cos/sin", function () {
            const step = Math.PI / 6;
            const length = 5;

            const zeroAngles = range(-Math.PI, Math.PI, step);
            const halfStepAngles = range(-Math.PI + step / 2, Math.PI, step);
            const angles = zeroAngles.concat(halfStepAngles);
            expect(angles.length).to.equal(12 + 11);
            for(const angle of angles) {
                const point = new CartesianPoint(
                    Math.cos(angle) * length, Math.sin(angle) * length);
                const pointLength = point.length();
                expect(pointLength).to.shallowDeepAlmostEqual(length);
            }
        });
    });
});
