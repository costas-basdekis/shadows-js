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
        const startAngles = range(Math.PI, -Math.PI, -Math.PI / 12);
        const anglesAndLines = makeAnglesAndLines(startAngles, width, startLength, endLength);

        describe("#denormalisedStartAngle", function () {
            it("Should normalise to angle", function () {
                for (const [angles, line] of anglesAndLines) {
                    const backAndForth =
                        PolarPoint.normaliseAngle(line.denormalisedStartAngle());
                    expect(backAndForth).to.shallowDeepAlmostEqual(line.start.angle);
                }
            });

            it("Should be less than end angle", function () {
                for (const [angles, line] of anglesAndLines) {
                    const denormalised = line.denormalisedStartAngle();
                    expect(denormalised).to.be.at.most(line.end.angle);
                }
            });
        });

        describe("#denormalisedEndAngle", function () {
            it("Should normalise to angle", function () {
                for (const [angles, line] of anglesAndLines) {
                    const backAndForth =
                        PolarPoint.normaliseAngle(line.denormalisedEndAngle());
                    expect(backAndForth).to.shallowDeepAlmostEqual(line.end.angle);
                }
            });

            it("Should be more than start angle", function () {
                for (const [angles, line] of anglesAndLines) {
                    const denormalised = line.denormalisedEndAngle();
                    expect(denormalised).to.be.at.least(line.start.angle);
                }
            });
        });

        describe("#denormalisedStartAngle/#denormalisedEndAngle", function () {
            it("Should be less than", function () {
                for (const [angles, line] of anglesAndLines) {
                    const startAngle = line.denormalisedStartAngle();
                    const endAngle = line.denormalisedEndAngle();
                    expect(startAngle).to.be.at.most(endAngle);
                }
            });
        });

        describe("#deltaAngle", function () {
            it("Should be positive", function () {
                for (const [angles, line] of anglesAndLines) {
                    expect(line.deltaAngle()).to.be.at.least(0);
                }
            });

            it("Should be the same as the difference", function () {
                for (const [angles, line] of anglesAndLines) {
                    if (line.goesOverPI) {
                        const expected = (Math.PI - line.start.angle) + (line.end.angle - (-Math.PI));
                        expect(line.deltaAngle()).to.equal(expected);
                    } else {
                        const expected = line.end.angle - line.start.angle;
                        expect(line.deltaAngle()).to.equal(expected);
                    }
                }
            });

            it("Should move start angle to end angle", function () {
                for (const [angles, line] of anglesAndLines) {
                    if (line.goesOverPI) {
                        expect(line.start.angle + line.deltaAngle()).to.equal(line.denormalisedEndAngle());
                    } else {
                        expect(line.start.angle + line.deltaAngle()).to.equal(line.end.angle);
                    }
                }
            });

            it("Should move end angle to start angle", function () {
                for (const [angles, line] of anglesAndLines) {
                    if (line.goesOverPI) {
                        expect(line.end.angle - line.deltaAngle()).to.equal(line.denormalisedStartAngle());
                    } else {
                        expect(line.end.angle - line.deltaAngle()).to.equal(line.start.angle);
                    }
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

        describe("#lengthAtAngle", function () {
            it("Should return start length for start angle", function () {
                for (const [[startAngle, endAngle, middleAngle], line] of anglesAndLines) {
                    expect(line.lengthAtAngle(startAngle)).to.equal(line.start.length);
                }
            });

            it("Should return end length for end angle", function () {
                for (const [[startAngle, endAngle, middleAngle], line] of anglesAndLines) {
                    expect(line.lengthAtAngle(endAngle)).to.equal(line.end.length);
                }
            });

            it("Should return end length for middle angle", function () {
                const middleLength = 5.2686863252131;
                for (const [[startAngle, endAngle, middleAngle], line] of anglesAndLines) {
                    expect(line.lengthAtAngle(middleAngle)).to.shallowDeepAlmostEqual(middleLength);
                }
            });

            it("Point for middle angle should be co-linear", function () {
                for (const [[startAngle, endAngle, middleAngle], line] of anglesAndLines) {
                    const middleLength = line.lengthAtAngle(middleAngle);
                    const startPoint = line.start.toCartesianPoint();
                    const endPoint = line.end.toCartesianPoint();
                    const middlePoint =
                        new PolarPoint(middleAngle, middleLength)
                            .toCartesianPoint();
                    const lineAtan2 = Math.atan2(
                        startPoint.y - endPoint.y,
                        startPoint.x - endPoint.x);
                    const startToMiddleAtan2 = Math.atan2(
                        startPoint.y - middlePoint.y,
                        startPoint.x - middlePoint.x);
                    const middleToEndAtan2 = Math.atan2(
                        middlePoint.y - endPoint.y,
                        middlePoint.x - endPoint.x);

                    expect(lineAtan2).to.shallowDeepAlmostEqual(startToMiddleAtan2);
                    expect(lineAtan2).to.shallowDeepAlmostEqual(middleToEndAtan2);
                }
            });

            it("Should throw if line has no range", function () {
                const line = new PolarLine(
                    new PolarPoint(1, 5),
                    new PolarPoint(1, 6)
                );
                expect(() => line.lengthAtAngle(1)).to.throw(Error);
            });

            it("Should throw if angle is out of range", function () {
                const line = new PolarLine(
                    new PolarPoint(1, 5),
                    new PolarPoint(2, 6)
                );
                expect(() => line.lengthAtAngle(0)).to.throw(Error);
                expect(() => line.lengthAtAngle(3)).to.throw(Error);
            });
        });
    });
});
