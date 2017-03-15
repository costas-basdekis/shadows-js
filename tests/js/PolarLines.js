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
    const cartesianRooms = Rooms.rooms
        .filter(room => !room.isSlow)
        .map(room => room.create());
    const cartesianRoomsLines = cartesianRooms.map(lines => new CartesianLines().addLines(lines));
    const centersAndRooms = cartesian(centers, cartesianRoomsLines).concat([
        // Because the two lines intersect on a point, on some angles, the
        // longer triangle is slightly smaller on the common point:
        // [
        //     "[{P:2.115253490184268@127.42448744256343} - {P:2.2420264583991414@124.55454851411712}]",
        //     // This wins --------------------------vv, this is ignored --------v
        //     "[{P:2.115253490184268@127.4244874425634} -  {P:2.2420264583991414@266.9026039588224}]"
        // ]
        [{x: 441, y: 316}, new CartesianLines().addLines([].concat(
            CartesianLines.linear(
                [300, 350],
                [450, 500]
            ),
            CartesianLines.linear(
                [375, 425],
                [275, 525]
            )
        ))],
        // The solution is to not have lines intersect
        [{x: 441, y: 316}, new CartesianLines().addLines([].concat(
            // So break the line at the intersection point
            CartesianLines.linear(
                [300, 350],
                [375, 425]
            ),
            CartesianLines.linear(
                [375, 425],
                [450, 500]
            ),
            CartesianLines.linear(
                [375, 425],
                [275, 525]
            )
        ))]
    ]);

    describe("#fromCartesianLines", function () {
        it("Should be able to crate maze room", function () {
            for (const [center, cartesianRoomLines] of centersAndRooms) {
                const room = new PolarLines()
                    .fromCartesianLines(center, cartesianRoomLines);
            }
        });
    });

    describe("#simplify", function () {
        it("Should work", function () {
            for (const [center, cartesianRoomLines] of centersAndRooms) {
                const room = new PolarLines()
                    .fromCartesianLines(center, cartesianRoomLines);
                room.simplify();
            }
        });
    });

    describe("#linesAngles", function () {
        it("Should return all angles in lines", function () {
            for (const [center, cartesianRoomLines] of centersAndRooms) {
                const room = new PolarLines()
                    .fromCartesianLines(center, cartesianRoomLines);
                const angles = PolarLines.linesAngles(room.lines);
                for (const line of room.lines) {
                    expect(angles).to.contain(line.start.angle);
                    expect(angles).to.contain(line.end.angle);
                }
            }
        });

        it("Should be unique", function () {
            for (const [center, cartesianRoomLines] of centersAndRooms) {
                const room = new PolarLines()
                    .fromCartesianLines(center, cartesianRoomLines);
                const angles = PolarLines.linesAngles(room.lines);
                const uniqueAngles = unique(angles);
                expect(uniqueAngles).to.deep.equal(angles);
            }
        });
    });

    describe("#anglesInLines", function () {
        it("Should contain the correct subsets", function () {
            for (const [center, cartesianRoomLines] of centersAndRooms) {
                const room = new PolarLines()
                    .fromCartesianLines(center, cartesianRoomLines);
                const angles =
                    PolarLines.linesAngles(room.lines);
                const anglesInLines =
                    PolarLines.anglesInLines(room.lines, angles);
                for (const [line, anglesInLine] of zip(room.lines, anglesInLines)) {
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
            for (const [center, cartesianRoomLines] of centersAndRooms) {
                const room = new PolarLines()
                    .fromCartesianLines(center, cartesianRoomLines);
                const angles =
                    PolarLines.linesAngles(room.lines);
                const anglesInLines =
                    PolarLines.anglesInLines(room.lines, angles);
                for (const [line, anglesInLine] of zip(room.lines, anglesInLines)) {
                    expect(unique(anglesInLine)).to.deep.equal(anglesInLine);
                }
            }
        });

        it("Should be ordered", function () {
            for (const [center, cartesianRoomLines] of centersAndRooms) {
                const room = new PolarLines()
                    .fromCartesianLines(center, cartesianRoomLines);
                const angles =
                    PolarLines.linesAngles(room.lines);
                const anglesInLines =
                    PolarLines.anglesInLines(room.lines, angles);
                for (const [line, anglesInLine] of zip(room.lines, anglesInLines)) {
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
            for (const [center, cartesianRoomLines] of centersAndRooms) {
                const room = new PolarLines()
                    .fromCartesianLines(center, cartesianRoomLines);
                const angles = PolarLines.linesAngles(room.lines);
                const anglesInLines =
                    PolarLines.anglesInLines(room.lines, angles);
                for (const [line, anglesInLine] of zip(room.lines, anglesInLines)) {
                    const splitLines = PolarLines.splitLine(line, anglesInLine);
                    expect(anglesInLine.length).to.equal(splitLines.length - 1);
                    for (const [angle, splitLine] of zip(anglesInLine, splitLines.slice(1))) {
                        expect(splitLine.start.angle).to.equal(angle);
                    }
                }
            }
        });

        it("Should create consecutive splits", function () {
            for (const [center, cartesianRoomLines] of centersAndRooms) {
                const room = new PolarLines()
                    .fromCartesianLines(center, cartesianRoomLines);
                const angles = PolarLines.linesAngles(room.lines);
                const anglesInLines =
                    PolarLines.anglesInLines(room.lines, angles);
                for (const [line, anglesInLine] of zip(room.lines, anglesInLines)) {
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
            for (const [center, cartesianRoomLines] of centersAndRooms) {
                const room = new PolarLines()
                    .fromCartesianLines(center, cartesianRoomLines);
                const angles = PolarLines.linesAngles(room.lines);
                const anglesInLines =
                    PolarLines.anglesInLines(room.lines, angles);
                for (const [line, anglesInLine] of zip(room.lines, anglesInLines)) {
                    const splitLines = PolarLines.splitLine(line, anglesInLine);
                    const deltaAngles = splitLines.map(line => line.deltaAngle());
                    expect(deltaAngles.filter(angle => angle < 0)).to.be.empty;
                }
            }
        });

        it("Should create angles that sum to the line's angle", function () {
            for (const [center, cartesianRoomLines] of centersAndRooms) {
                const room = new PolarLines()
                    .fromCartesianLines(center, cartesianRoomLines);
                const angles = PolarLines.linesAngles(room.lines);
                const anglesInLines =
                    PolarLines.anglesInLines(room.lines, angles);
                for (const [line, anglesInLine] of zip(room.lines, anglesInLines)) {
                    const splitLines = PolarLines.splitLine(line, anglesInLine);
                    const deltaAngles = splitLines.map(line => line.deltaAngle());
                    const anglesSum = deltaAngles.reduce((total, angle) => total + angle, 0);
                    expect(anglesSum).to.shallowDeepAlmostEqual(line.deltaAngle());
                }
            }
        });
    });

    describe("removeHiddenLines", function () {
        it("Hidden lines should be a subset of all lines", function () {
            for (const [center, cartesianRoomLines] of centersAndRooms) {
                const room = new PolarLines()
                    .fromCartesianLines(center, cartesianRoomLines);
                const angles = PolarLines.linesAngles(room.lines);
                const anglesInLines =
                    PolarLines.anglesInLines(room.lines, angles);
                const splitLines = PolarLines.splitLines(room.lines, anglesInLines);
                const visibleLines = PolarLines.removeHiddenLines(splitLines);
                const hiddenLines = splitLines
                    .filter(line => visibleLines.indexOf(line) === -1);
                expect(hiddenLines.length).to.be.at.least(1);
                expect(visibleLines.length).to.be.at.least(1);
                for (const line of splitLines) {
                    expect((hiddenLines.indexOf(line) !== -1)
                        !== (visibleLines.indexOf(line) !== -1));
                }
            }
        });

        it("Hidden lines should have a line with higher start/end length", function () {
            for (const [center, cartesianRoomLines] of centersAndRooms) {
                const room = new PolarLines()
                    .fromCartesianLines(center, cartesianRoomLines);
                const angles = PolarLines.linesAngles(room.lines);
                const anglesInLines =
                    PolarLines.anglesInLines(room.lines, angles);
                const splitLines = PolarLines.splitLines(room.lines, anglesInLines);
                const visibleLines = PolarLines.removeHiddenLines(splitLines);
                const hiddenLines = splitLines
                    .filter(line => visibleLines.indexOf(line) === -1);
                expect(hiddenLines.length).to.be.at.least(1);
                expect(visibleLines.length).to.be.at.least(1);
                for (const hiddenLine of hiddenLines) {
                    for (const visibleLine of visibleLines) {
                        if (hiddenLine.start.angle !== visibleLine.start.angle
                                || hiddenLine.end.angle !== visibleLine.end.angle) {
                            continue;
                        }
                        if (hiddenLine.start.length < visibleLine.start.length) {
                            expect(hiddenLine.start.length).to.shallowDeepAlmostEqual(visibleLine.start.length);
                        } else {
                            expect(hiddenLine.start.length).to.be.at.least(visibleLine.start.length);
                        }
                        if (hiddenLine.end.length < visibleLine.end.length) {
                            expect(hiddenLine.end.length).to.shallowDeepAlmostEqual(visibleLine.end.length);
                        } else {
                            expect(hiddenLine.end.length).to.be.at.least(visibleLine.end.length);
                        }
                    }
                }
            }
        });

        it("Visible lines shouldn't have a line with higher start/end length", function () {
            for (const [center, cartesianRoomLines] of centersAndRooms) {
                const room = new PolarLines()
                    .fromCartesianLines(center, cartesianRoomLines);
                const angles = PolarLines.linesAngles(room.lines);
                const anglesInLines =
                    PolarLines.anglesInLines(room.lines, angles);
                const splitLines = PolarLines.splitLines(room.lines, anglesInLines);
                const visibleLines = PolarLines.removeHiddenLines(splitLines);
                for (const visibleLine1 of visibleLines) {
                    for (const visibleLine2 of visibleLines) {
                        if (visibleLine1.start.angle !== visibleLine2.start.angle
                            || visibleLine1.end.angle !== visibleLine2.end.angle) {
                            continue;
                        }
                        expect(visibleLine1.start.length).to.be.at.least(visibleLine2.start.length);
                        expect(visibleLine1.end.length).to.be.at.least(visibleLine2.end.length);
                    }
                }
            }
        });
    });
});
