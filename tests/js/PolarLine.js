function makeAnglesAndLines(startAngles, width, startLength, endLength=null) {
    if (endLength === null) {
        endLength = startLength;
    }
    const endAngles = startAngles.map(startAngle => startAngle + width);
    const middleAngles = zip(startAngles, endAngles).map(
        ([startAngle, endAngle]) => (startAngle + endAngle) / 2);
    const startEndMiddleAngles = zip(startAngles, endAngles, middleAngles);

    const lines = startEndMiddleAngles.map(
        ([startAngle, endAngle, middleAngle]) => new PolarLine(
            new PolarPoint(startAngle, startLength),
            new PolarPoint(endAngle, endLength)));

    const anglesAndLines = zip(startEndMiddleAngles, lines);

    return anglesAndLines;
}

describe("PolarLine", function () {
    describe("constructor", function () {
        it("Should have a start and end", function () {
            const line = new PolarLine(
                new PolarPoint(1, 5),
                new PolarPoint(-1, 5)
            );
            expect(line.start).be.not.null;
            expect(line.end).be.not.null;
        });

        it("Should have same start and end regardless of creation", function () {
            const start = new PolarPoint(1, 5);
            const end = new PolarPoint(-1, 5);
            const line1 = new PolarLine(start, end);
            const line2 = new PolarLine(end, start);

            expect(line1.start).to.deep.equal(line2.start);
            expect(line1.end).to.deep.equal(line2.end);
        });

        it("When spanning two quadrants, from 3rd, it goes over PI", function () {
            const length = 5;
            const width = -Math.PI / 1.9;
            const startAngles = range(-Math.PI / 2, -Math.PI, -Math.PI / 12);
            const anglesAndLines = makeAnglesAndLines(startAngles, width, length);

            for (const [angles, line] of anglesAndLines) {
                expect(line.goesOverPI).be.true;
            }
        });

        it("When spanning two quadrants, from 1st/2nd/4th, it doesn't go over PI", function () {
            const width = -Math.PI / 1.9;
            const startLength = 5, endLength = 6;
            const startAngles = range(Math.PI, -Math.PI / 2, -Math.PI / 12);
            const anglesAndLines = makeAnglesAndLines(startAngles, width, startLength, endLength);

            for (const [angles, line] of anglesAndLines) {
                expect(line.goesOverPI).be.false;
            }
        });
    });

    describe("On [PI, -PI : -PI / 12] - PI / 1.9", function () {
        const width = -Math.PI / 1.9;
        const startLength = 5, endLength = 6;
        const startAngles = range(Math.PI, -Math.PI / 2, -Math.PI / 12);
        const anglesAndLines = makeAnglesAndLines(startAngles, width, startLength, endLength);

        describe("#unnormalisedStartAngle", function () {
            it("Should normalise to angle", function () {
                for (const [angles, line] of anglesAndLines) {
                    const backAndForth =
                        PolarPoint.normaliseAngle(line.unnormalisedStartAnlge());
                    expect(backAndForth).to.shallowDeepAlmostEqual(line.start.angle);
                }
            });
        });

        describe("#unnormalisedEndAngle", function () {
            it("Should normalise to angle", function () {
                for (const [angles, line] of anglesAndLines) {
                    const backAndForth =
                        PolarPoint.normaliseAngle(line.unnormalisedEndAnlge());
                    expect(backAndForth).to.shallowDeepAlmostEqual(line.end.angle);
                }
            });
        });

        describe("#unnormalisedStartAngle/#unnormalisedEndAngle", function () {
            it("Should be less than", function () {
                for (const [angles, line] of anglesAndLines) {
                    const startAngle = line.unnormalisedStartAnlge();
                    const endAngle = line.unnormalisedEndAnlge();
                    expect(startAngle).to.be.at.most(endAngle);
                }
            });
        });
    });

    describe("On [-PI, PI : PI / 6.5] + PI / 6", function () {
        const width = Math.PI / 6;
        const startLength = 5, endLength = 6;
        const startAngles = range(-Math.PI, Math.PI, Math.PI / 6.5);
        const anglesAndLines = makeAnglesAndLines(startAngles, width, startLength, endLength);

        describe("#containsAngle", function () {
            it("Should contain start angle", function () {
                for (const [[startAngle, endAngle, middleAngle], line] of anglesAndLines) {
                    expect(line.containsAngle(startAngle)).to.be.true;
                }
            });

            it("Should contain angle in the middle of the range", function () {
                for (const [[startAngle, endAngle, middleAngle], line] of anglesAndLines) {
                    expect(line.containsAngle(middleAngle)).to.be.true;
                }
            });

            it("Should contain end angle", function () {
                for (const [[startAngle, endAngle, middleAngle], line] of anglesAndLines) {
                    expect(line.containsAngle(endAngle)).to.be.true;
                }
            });
        });

        describe("#strictlyContainsAngle", function () {
            it("Should not contain start angle", function () {
                for (const [[startAngle, endAngle, middleAngle], line] of anglesAndLines) {
                    expect(line.strictlyContainsAngle(startAngle)).to.be.false;
                }
            });

            it("Should contain angle in the middle of the range", function () {
                for (const [[startAngle, endAngle, middleAngle], line] of anglesAndLines) {
                    expect(line.strictlyContainsAngle(middleAngle)).to.be.true;
                }
            });

            it("Should not contain end angle", function () {
                for (const [[startAngle, endAngle, middleAngle], line] of anglesAndLines) {
                    expect(line.strictlyContainsAngle(endAngle)).to.be.false;
                }
            });
        });
});
