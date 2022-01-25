const { expect } = require('./lib/chai-v3.5.0');
const {
    cartesian, compare, range, sortWithCompare, unique, zip, almostEquals,
} = require("../../js/utils");
const { CartesianLines } = require("../../js/CartesianLines");
const { CartesianPoint } = require("../../js/CartesianPoint");
const { PolarLines } = require("../../js/PolarLines");
const { PolarLine } = require("../../js/PolarLine");
const { PolarPoint } = require("../../js/PolarPoint");
const { Rooms } = require("../../js/Rooms");

describe("PolarLines", function () {
    const cartesianRoomsLines = Rooms.rooms
        .filter(room => !room.isSlow)
        .map(room => new room().createLines());

    const centers = cartesian(range(-50, 650, 200), range(-50, 650, 200))
        .map(([x ,y]) => (new CartesianPoint(x, y)));
    const centersAndRooms = cartesian(centers, cartesianRoomsLines).concat([
        // Because the two lines intersect on a point, on some angles, the
        // longer triangle is slightly smaller on the common point:
        // [
        //     "[{P:2.115253490184268@127.42448744256343} - {P:2.2420264583991414@124.55454851411712}]",
        //     // This wins --------------------------vv, this is ignored --------v
        //     "[{P:2.115253490184268@127.4244874425634} -  {P:2.2420264583991414@266.9026039588224}]"
        // ]
        [new CartesianPoint(441, 316), new CartesianLines(null, "Intersecting lines").addLines([].concat(
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
        [new CartesianPoint(441, 316), new CartesianLines(null, "Intersecting lines bug buster").addLines([].concat(
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

    function createCasesForCentersAndRooms(func) {
        for (const [center, cartesianRoomLines] of centersAndRooms) {
            it(`For room ${cartesianRoomLines.name}, center ${center}`, function () {
                const room = new PolarLines()
                    .fromCartesianLines(center, cartesianRoomLines);
                func(center, cartesianRoomLines, room);
            });
        }
    }

    describe("constructor", function () {
        it("Should have lines", function () {
            expect(new PolarLines().lines).to.deep.equal([]);
        });

        it("Should have 16 different centers", function () {
            expect(centers.length).to.equal(16);
        });
    });

    describe("#fromCartesianLines", function () {
        describe("Should be able to crate maze room", function () {
            createCasesForCentersAndRooms(function (center, cartesianRoomLines, room){
            });
        });
    });

    describe("#simplify", function () {
        describe("Should work", function () {
            createCasesForCentersAndRooms(function (center, cartesianRoomLines, room){
                room.simplify();
            });
        });
    });

    describe("#linesAngles", function () {
        describe("Should return all angles in lines", function () {
            createCasesForCentersAndRooms(function (center, cartesianRoomLines, room){
                const angles = PolarLines.linesAngles(room.lines);
                for (const line of room.lines) {
                    expect(angles).to.contain(line.start.angle);
                    expect(angles).to.contain(line.end.angle);
                }
            });
        });

        describe("Should be unique", function () {
            createCasesForCentersAndRooms(function (center, cartesianRoomLines, room){
                const angles = PolarLines.linesAngles(room.lines);
                const uniqueAngles = unique(angles);
                expect(uniqueAngles).to.deep.equal(angles);
            });
        });
    });

    describe("#anglesInLines", function () {
        describe("Should contain the correct subsets", function () {
            createCasesForCentersAndRooms(function (center, cartesianRoomLines, room){
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
            });
        });

        describe("Should be unique for each line", function () {
            createCasesForCentersAndRooms(function (center, cartesianRoomLines, room){
                const angles =
                    PolarLines.linesAngles(room.lines);
                const anglesInLines =
                    PolarLines.anglesInLines(room.lines, angles);
                for (const [line, anglesInLine] of zip(room.lines, anglesInLines)) {
                    expect(unique(anglesInLine)).to.deep.equal(anglesInLine);
                }
            });
        });

        describe("Should be ordered", function () {
            createCasesForCentersAndRooms(function (center, cartesianRoomLines, room){
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
            });
        });
    });

    describe("#splitLines", function () {
        describe("Should create a line for each angle", function () {
            createCasesForCentersAndRooms(function (center, cartesianRoomLines, room){
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
            });
        });

        describe("Should create consecutive splits", function () {
            createCasesForCentersAndRooms(function (center, cartesianRoomLines, room){
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
            });
        });

        describe("Should create angles that are positive", function () {
            createCasesForCentersAndRooms(function (center, cartesianRoomLines, room){
                const angles = PolarLines.linesAngles(room.lines);
                const anglesInLines =
                    PolarLines.anglesInLines(room.lines, angles);
                for (const [line, anglesInLine] of zip(room.lines, anglesInLines)) {
                    const splitLines = PolarLines.splitLine(line, anglesInLine);
                    const deltaAngles = splitLines.map(line => line.deltaAngle());
                    expect(deltaAngles.filter(angle => angle < 0)).to.be.empty;
                }
            });
        });

        describe("Should create angles that sum to the line's angle", function () {
            createCasesForCentersAndRooms(function (center, cartesianRoomLines, room){
                const angles = PolarLines.linesAngles(room.lines);
                const anglesInLines =
                    PolarLines.anglesInLines(room.lines, angles);
                for (const [line, anglesInLine] of zip(room.lines, anglesInLines)) {
                    const splitLines = PolarLines.splitLine(line, anglesInLine);
                    const deltaAngles = splitLines.map(line => line.deltaAngle());
                    const anglesSum = deltaAngles.reduce((total, angle) => total + angle, 0);
                    expect(anglesSum).to.shallowDeepAlmostEqual(line.deltaAngle());
                }
            });
        });
    });

    describe("removeHiddenLines", function () {
        describe("Hidden lines should be a subset of all lines", function () {
            createCasesForCentersAndRooms(function (center, cartesianRoomLines, room){
                const angles = PolarLines.linesAngles(room.lines);
                const anglesInLines =
                    PolarLines.anglesInLines(room.lines, angles);
                const splitLines = PolarLines.splitLines(room.lines, anglesInLines);
                const visibleLines = PolarLines.removeHiddenLines(splitLines);
                const hiddenLines = splitLines
                    .filter(line => visibleLines.indexOf(line) === -1);
                expect(visibleLines.length).to.be.at.least(1);
                for (const line of splitLines) {
                    expect((hiddenLines.indexOf(line) !== -1)
                        !== (visibleLines.indexOf(line) !== -1));
                }
            });
        });

        describe("Hidden lines should have a line with higher start/end length", function () {
            createCasesForCentersAndRooms(function (center, cartesianRoomLines, room){
                const angles = PolarLines.linesAngles(room.lines);
                const anglesInLines =
                    PolarLines.anglesInLines(room.lines, angles);
                const splitLines = PolarLines.splitLines(room.lines, anglesInLines);
                const visibleLines = PolarLines.removeHiddenLines(splitLines);
                const hiddenLines = splitLines
                    .filter(line => visibleLines.indexOf(line) === -1);
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
            });
        });

        describe("Visible lines shouldn't have a line with higher start/end length", function () {
            createCasesForCentersAndRooms(function (center, cartesianRoomLines, room){
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
            });
        });
    });

    describe("#joinLines", function () {
        it("Should be join 3 consecutive lines", function () {
            const lines = [
                new PolarLine(new PolarPoint(0, 10), new PolarPoint(1, 10)),
                new PolarLine(new PolarPoint(1, 10), new PolarPoint(2, 10)),
                new PolarLine(new PolarPoint(2, 10), new PolarPoint(3, 10)),
            ];
            for (const line of lines) {
                line.sourceId = 1;
            }
            const joinedLines = PolarLines.joinLines(lines);
            const expectedJoinedLine = new PolarLine(
                new PolarPoint(0, 10), new PolarPoint(3, 10));
            expect(joinedLines.map(line => `${line}`)).to.deep.equal([expectedJoinedLine].map(line => `${line}`));
        });

        it("Should be join 3 consecutive lines in reverse", function () {
            const lines = [
                new PolarLine(new PolarPoint(2, 10), new PolarPoint(3, 10)),
                new PolarLine(new PolarPoint(1, 10), new PolarPoint(2, 10)),
                new PolarLine(new PolarPoint(0, 10), new PolarPoint(1, 10)),
            ];
            for (const line of lines) {
                line.sourceId = 1;
            }
            const joinedLines = PolarLines.joinLines(lines);
            const expectedJoinedLine = new PolarLine(
                new PolarPoint(0, 10), new PolarPoint(3, 10));
            expect(joinedLines.map(line => `${line}`)).to.deep.equal([expectedJoinedLine].map(line => `${line}`));
        });
    });

    describe("#removeObviouslyHiddenLines", function () {
        function getLinesWithObviousHiddenLines(lines) {
            const angles = PolarLines.linesAngles(lines);
            const anglesInLines =
                PolarLines.anglesInLines(lines, angles);
            const splitLines = PolarLines.splitLines(lines, anglesInLines);
            const visibleLines = PolarLines.removeHiddenLines(splitLines);
            const joinedLines = PolarLines.joinLines(visibleLines);

            return joinedLines;
        }
        function getLinesWithoutObviousHiddenLines(lines) {
            const reachableLines = PolarLines.removeObviouslyHiddenLines(lines);
            return getLinesWithObviousHiddenLines(reachableLines);
        }

        describe("Should be a subset of the lines", function () {
            createCasesForCentersAndRooms(function (center, cartesianRoomLines, room) {
                const withoutObviousHiddenLines = getLinesWithoutObviousHiddenLines(room.lines);
                const newLines = withoutObviousHiddenLines.filter(line => room.lines.indexOf(line) < 0);
                expect(newLines).to.be.emtpy;
            });
        });

        describe("Should get same result, with and without obviously hidden lines", function () {
            createCasesForCentersAndRooms(function (center, cartesianRoomLines, room) {
                const withoutObviousHiddenLines = getLinesWithoutObviousHiddenLines(room.lines);
                const withObviousHiddenLines = getLinesWithObviousHiddenLines(room.lines);

                const textsWithout = withoutObviousHiddenLines
                    .map(line => `${line}`)
                    .sort(compare);
                const textsWith = withObviousHiddenLines
                    .map(line => `${line}`)
                    .sort(compare);
                try {
                    expect(textsWithout).to.deep.equal(textsWith);
                } catch (e) {
                    throw e;
                }
            });
        });
    });

    describe("#absAtan2", () => {
        it("Parallel lines should have same absAtan2", () => {
            const line1 = new PolarLine(new PolarPoint(2.819842099193151, 221.35943621178654), new PolarPoint(2.9018495447193366, 294.7950681938305));
            const line2 = new PolarLine(new PolarPoint(2.9018495447193366, 294.7950681938305), new PolarPoint(2.904743892642873, 298.328677803526));
            expect(line1.absAtan2()).to.angleAlmostEquals(line2.absAtan2());
        });
    });
});
