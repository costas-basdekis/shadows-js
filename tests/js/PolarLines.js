"use strict";

describe("PolarLines", function () {
    describe("constructor", function () {
        it("Should have lines", function () {
            expect(new PolarLines().lines).to.deep.equal([]);
        });
    });

    const centers = cartesian(range(-50, 650, 200), range(-50, 650, 200))
        .map(([x ,y]) => ({x: x, y: y}));
    it("Should have 16 different centers", function () {
        expect(centers.length).to.equal(16);
    });
    const mazeRoomCartesian = Rooms.createMaze();
    const mazeRoomCartesianLines = new CartesianLines().addLines(mazeRoomCartesian);

    describe("#fromCartesianLines", function () {
        it("Should be able to crate maze room", function () {
            for (const center of centers) {
                const mazeRoom = new PolarLines()
                    .fromCartesianLines(center, mazeRoomCartesianLines);
            }
        });
    });

    describe("#simplify", function () {
        it("Should work", function () {
            for (const center of centers) {
                const mazeRoom = new PolarLines()
                    .fromCartesianLines(center, mazeRoomCartesianLines);
                mazeRoom.simplify();
            }
        });
    });

    describe("#linesAngles", function () {
        it("Should return all angles in lines", function () {
            for (const center of centers) {
                const mazeRoom = new PolarLines()
                    .fromCartesianLines(center, mazeRoomCartesianLines);
                const angles = PolarLines.linesAngles(mazeRoom.lines);
                for (const line of mazeRoom.lines) {
                    expect(angles).to.contain(line.start.angle);
                    expect(angles).to.contain(line.end.angle);
                }
            }
        });

        it("Should be unique", function () {
            for (const center of centers) {
                const mazeRoom = new PolarLines()
                    .fromCartesianLines(center, mazeRoomCartesianLines);
                const angles = PolarLines.linesAngles(mazeRoom.lines);
                const uniqueAngles = unique(angles);
                expect(uniqueAngles).to.deep.equal(angles);
            }
        });
    });

    describe("#anglesInLines", function () {
        it("Should contain the correct subsets", function () {
            for (const center of centers) {
                const mazeRoom = new PolarLines()
                    .fromCartesianLines(center, mazeRoomCartesianLines);
                const angles =
                    PolarLines.linesAngles(mazeRoom.lines);
                const anglesInLines =
                    PolarLines.anglesInLines(mazeRoom.lines, angles);
                for (const [line, anglesInLine] of zip(mazeRoom.lines, anglesInLines)) {
                    for (const angle of angles) {
                        if (anglesInLine.indexOf(angle) >= 0) {
                            expect(line.strictlyContainsAngle(angle)).to.be.true;
                        } else {
                            expect(line.strictlyContainsAngle(angle)).to.be.false;
                        }
                    }
                }
            }
        });

        it("Should be unique for each line", function () {
            for (const center of centers) {
                const mazeRoom = new PolarLines()
                    .fromCartesianLines(center, mazeRoomCartesianLines);
                const angles =
                    PolarLines.linesAngles(mazeRoom.lines);
                const anglesInLines =
                    PolarLines.anglesInLines(mazeRoom.lines, angles);
                for (const [line, anglesInLine] of zip(mazeRoom.lines, anglesInLines)) {
                    expect(unique(anglesInLine)).to.deep.equal(anglesInLine);
                }
            }
        });

        it("Should be ordered", function () {
            for (const center of centers) {
                const mazeRoom = new PolarLines()
                    .fromCartesianLines(center, mazeRoomCartesianLines);
                const angles =
                    PolarLines.linesAngles(mazeRoom.lines);
                const anglesInLines =
                    PolarLines.anglesInLines(mazeRoom.lines, angles);
                for (const [line, anglesInLine] of zip(mazeRoom.lines, anglesInLines)) {
                    if (!line.goesOverPI) {
                        expect(sortWithCompare(anglesInLine)).to.deep.equal(anglesInLine);
                    } else {
                        const positive = anglesInLine.filter(angle => angle >= 0);
                        const negative = anglesInLine.filter(angle => angle < 0);
                        const sorted = sortWithCompare(positive)
                            .concat(sortWithCompare(negative));
                        expect(sorted).to.deep.equal(anglesInLine);
                    }
                }
            }
        });
    });

    describe("#splitLines", function () {
        it("Should create a line for each angle", function () {
            for (const center of centers) {
                const mazeRoom = new PolarLines()
                    .fromCartesianLines(center, mazeRoomCartesianLines);
                const angles = PolarLines.linesAngles(mazeRoom.lines);
                const anglesInLines =
                    PolarLines.anglesInLines(mazeRoom.lines, angles);
                for (const [line, anglesInLine] of zip(mazeRoom.lines, anglesInLines)) {
                    const splitLines = PolarLines.splitLine(line, anglesInLine);
                    expect(anglesInLine.length).to.equal(splitLines.length - 1);
                    for (const [angle, splitLine] of zip(anglesInLine, splitLines.slice(1))) {
                        expect(splitLine.start.angle).to.equal(angle);
                    }
                }
            }
        });

        it("Should create consecutive splits", function () {
            for (const center of centers) {
                const mazeRoom = new PolarLines()
                    .fromCartesianLines(center, mazeRoomCartesianLines);
                const angles = PolarLines.linesAngles(mazeRoom.lines);
                const anglesInLines =
                    PolarLines.anglesInLines(mazeRoom.lines, angles);
                for (const [line, anglesInLine] of zip(mazeRoom.lines, anglesInLines)) {
                    const splitLines = PolarLines.splitLine(line, anglesInLine);
                    const firstLine = splitLines[0].start;
                    const lastLine = splitLines.slice(-1)[0].end;
                    expect(firstLine).to.deep.equal(line.start);
                    expect(lastLine).to.deep.equal(line.end);
                    for (const index of range(1, splitLines.length)) {
                        const previousPoint = splitLines[index - 1].end;
                        const nextPoint = splitLines[index].start;
                        expect(previousPoint.angle).to.shallowDeepAlmostEqual(nextPoint.angle);
                        expect(previousPoint.length).to.shallowDeepAlmostEqual(nextPoint.length);
                    }
                }
            }
        });

        it("Should create angles that are positive", function () {
            for (const center of centers) {
                const mazeRoom = new PolarLines()
                    .fromCartesianLines(center, mazeRoomCartesianLines);
                const angles = PolarLines.linesAngles(mazeRoom.lines);
                const anglesInLines =
                    PolarLines.anglesInLines(mazeRoom.lines, angles);
                for (const [line, anglesInLine] of zip(mazeRoom.lines, anglesInLines)) {
                    const splitLines = PolarLines.splitLine(line, anglesInLine);
                    const deltaAngles = splitLines.map(line => line.deltaAngle());
                    expect(deltaAngles.filter(angle => angle < 0)).to.be.empty;
                }
            }
        });

        it("Should create angles that sum to the line's angle", function () {
            for (const center of centers) {
                const mazeRoom = new PolarLines()
                    .fromCartesianLines(center, mazeRoomCartesianLines);
                const angles = PolarLines.linesAngles(mazeRoom.lines);
                const anglesInLines =
                    PolarLines.anglesInLines(mazeRoom.lines, angles);
                for (const [line, anglesInLine] of zip(mazeRoom.lines, anglesInLines)) {
                    const splitLines = PolarLines.splitLine(line, anglesInLine);
                    const deltaAngles = splitLines.map(line => line.deltaAngle());
                    const anglesSum = deltaAngles.reduce((total, angle) => total + angle, 0);
                    expect(anglesSum).to.shallowDeepAlmostEqual(line.deltaAngle());
                }
            }
        });
    });
});
