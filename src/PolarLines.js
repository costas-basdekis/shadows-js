const paper = typeof window === typeof undefined ? null : require("./lib/paper-full-v0.10.3");
const { PolarLine } = require("./PolarLine");
const {
    compare, groupBy, sortWithCompare, sortWithCompareFunc, unique, zip,
} = require("./utils");

class PolarLines {
    constructor(name=null) {
        this.lines = [];
        this.path = null;
        this.name = name;
    }

    clear() {
        this.lines = [];
    }

    fromCartesianLines(center, cartesianLines) {
        this.lines = cartesianLines.lines
            .map(line => PolarLine.fromCartesianLine(center, line))
            .filter(line => line.start.length > 0 && line.end.length > 0);
        this.name = cartesianLines.name;

        return this;
    }

    simplify() {
        const reachableLines = PolarLines.removeObviouslyHiddenLines(this.lines);
        const angles = PolarLines.linesAngles(reachableLines);
        const anglesInLines = PolarLines.anglesInLines(reachableLines, angles);
        const splitLines = PolarLines.splitLines(reachableLines, anglesInLines);
        const visibleLines = PolarLines.removeHiddenLines(splitLines);
        const joinedLines = PolarLines.joinLines(visibleLines);

        this.lines = joinedLines;
    }

    static removeObviouslyHiddenLines(lines) {
        const angles = PolarLines.linesAngles(lines);
        const anglePairs =
            zip(angles, angles.slice(1).concat(angles.slice(0, 1)));
        const linesInAnglePairs = anglePairs.map(
            ([start, end]) => lines.filter(
                line => line.containsAngle(start) && line.containsAngle(end)));
        const minMaxDistancePerAnglePair = linesInAnglePairs
            .map(linesInAnglePair => linesInAnglePair.map(line => line.maxDistance))
            .map(maxDistances => Math.min(...maxDistances));
        const reachableLinesPerAnglePair = zip(linesInAnglePairs, minMaxDistancePerAnglePair)
            .map(([linesInAnglePair, minMaxDistance]) => linesInAnglePair.filter(
                line => line.minDistance <= minMaxDistance));
        const reachableLines = unique(sortWithCompareFunc([].concat(...reachableLinesPerAnglePair)));

        // console.log(`Hid ${lines.length - reachableLines.length} out of ${lines.length}, leaving ${reachableLines.length}`);

        return reachableLines;
    }

    static linesAngles(lines) {
        const unsortedAngles = [].concat(
            lines.map(line => line.start.angle),
            lines.map(line => line.end.angle)
        );
        const sortedAngles = sortWithCompare(unsortedAngles);
        const angles = unique(sortedAngles);
        // console.log("Angles:", angles);

        return angles;
    }

    static anglesInLines(lines, angles) {
        const anglesInLines = lines
            .map(line => this.anglesInLine(line, angles));
        // for (const anglesInLine of anglesInLines) {
        //     console.log(`Line contains ${anglesInLine.length} angles: ${line.start.angle} - ${anglesInLine.join(', ')} - ${line.end.angle}`);
        // }

        return anglesInLines;
    }

    static anglesInLine(line, angles) {
        const unsortedAnglesInLines = angles
            .filter(angle => line.strictlyContainsAngle(angle));
        let anglesInLine;
        if (!line.goesOverPI) {
            anglesInLine = unsortedAnglesInLines;
        } else {
            const positive = unsortedAnglesInLines.filter(angle => angle >= 0);
            const negative = unsortedAnglesInLines.filter(angle => angle < 0);
            anglesInLine = sortWithCompare(positive)
                .concat(sortWithCompare(negative))
        }

        return anglesInLine;
    }

    static splitLines(lines, anglesInLines) {
        const splitLines = [].concat(...zip(lines, anglesInLines)
            .map(([line, anglesInLine]) => this.splitLine(line, anglesInLine)))
            .filter(line => line.start.angle !== line.end.angle);
        // console.log("Split lines:", sortedSplitLines.map(line => `${line.sortKey()[0]},${line.sortKey()[1]}`));

        return splitLines;
    }

    static splitLine(line, anglesInLine) {
        if (line.start.angle === line.end.angle) {
            return [line];
        }

        const startEndAngles =  zip(
            [line.start.angle].concat(anglesInLine),
            anglesInLine.concat([line.end.angle])
        );
        const splitLines = startEndAngles.map(
            ([startAngle, endAngle]) => line.atAngles(startAngle, endAngle));

        return splitLines;
    }

    static removeHiddenLines(lines) {
        const byKey = groupBy(lines,
            line => `${line.start.angle},${line.end.angle}`);
        const groups = Object.keys(byKey).map(key => byKey[key]);

        // Instead of sorting by least lengths, we sort by least deviation from
        // shortest lengths, to account for a line's end intersecting another
        // line
        const sortFunc = this.sortLinesByLeastDeviation;
        // const = sortWithCompareFunc;

        const nonOverlapping = groups
            .map(sortFunc)
            .map(group => group[0]);

        return nonOverlapping;
    }

    static sortLinesByLeastDeviation(lines) {
        // Sort the lines by least deviation from the shortest lengths. This
        // means we can avoid the issue were a line's end intersects another
        // line, and the first line has a slightly smaller length than the the
        // point on the second line, thus tolerating the shortest line to be
        // slightly more lengthy than another one, on one end.
        const shortestStartLength = lines
            .map(line => line.start.length)
            .sort(compare)
            [0];
        const shortestEndLength = lines
            .map(line => line.end.length)
            .sort(compare)
            [0];

        function deviationSortKey(line) {
            return Math.abs(line.start.length - shortestStartLength)
                + Math.abs(line.end.length - shortestEndLength);
        }

        function deviationCompareFunc(lhs, rhs) {
            return compare(deviationSortKey(lhs), deviationSortKey((rhs)));
        }

        const sortedLines = lines
            .sort(deviationCompareFunc);

        return sortedLines;
    }

    static joinLines(lines) {
        const sorted = sortWithCompareFunc(lines);
        const joined = [];

        for (const line of sorted) {
            const previousLine = joined.slice(-1)[0];
            if (!previousLine) {
                joined.push(line);
                continue;
            }

            if (previousLine.isCoLinear(line)
                    && previousLine.end.almostEquals(line.start)) {
                previousLine.end = line.end;
                continue;
            }

            joined.push(line)
        }

        const firstLine = joined[0];
        const lastLine = joined.slice(-1)[0];
        if (firstLine
                && lastLine !== firstLine
                && lastLine.isCoLinear(firstLine)
                && lastLine.end.almostEquals(firstLine.start)) {
            firstLine.start = lastLine.start;
            joined.pop();
        }

        return joined;
    }

    static toPath(lines, center, compoundPath=null, showRays=true) {
        if (!compoundPath) {
            compoundPath = new paper.CompoundPath();
        } else {
            for (const child of compoundPath.children) {
                child.remove();
            }
            compoundPath.children = [];
        }
        let paths;
        if (showRays) {
            paths = PolarLines.toPathWithRays(lines, center);
        } else {
            paths = PolarLines.toPathsWithoutRays(lines, center);
        }
        compoundPath.children.push(...paths);

        return compoundPath;
    }

    static toPathWithRays(lines, center) {
        return lines.map(line => line.toPath(center));
    }

    static toPathsWithoutRays(lines, center) {
        const polygon = this.toPolygon(lines, center);
        const path = new paper.Path();

        if (!polygon.length) {
            return path;
        }

        const start = polygon[0];
        const rest = polygon.slice(1);

        path.moveTo(start);

        for (const point of rest) {
            path.lineTo(point);
        }

        return [path];
    }

    static toPolygon(lines, center) {
        const points = [].concat(...lines.map(line => [
            [
                line.start,
                line.start.toCartesianPoint().plus(center),
                true,
            ],
            [
                line.end,
                line.end.toCartesianPoint().plus(center),
                false,
            ],
        ]));

        if (!points.length) {
            return [];
        }

        const previousPoints = points.slice(-1).concat(points.slice(0, -1));
        const pointsAndPreviousPoints = zip(points, previousPoints);

        const [polarEnd, end, endIsStart] = previousPoints[0];
        // console.log(pointsAndPreviousPoints);

        const polygon = [];

        polygon.push(end);
        // console.log(`Start on ${end}`);

        for (const [[polarPoint, point, pointIsStart],
            [previousPolarPoint, previousPoint, previousPointIsStart]]
            of pointsAndPreviousPoints) {
            // console.log(`Is start? ${pointIsStart}, ${polarPoint.angle} ?== ${previousPolarPoint.angle}: ${polarPoint.angle === previousPolarPoint.angle}`)
            if (pointIsStart && polarPoint.angle !== previousPolarPoint.angle) {
                polygon.push(center);
                // console.log("Move to center");
            }
            if (!point.equals(previousPoint)) {
                polygon.push(point);
                // console.log(`Move to ${point}`);
            } else {
                // console.log(`Points are equal ${point} === ${previousPoint}`);
            }
        }

        return polygon;
    }

    updatePath(center, showRays=true) {
        if (!this.path) {
            this.path = new paper.CompoundPath();
        }
        PolarLines.toPath(this.lines, center, this.path, showRays);
    }
}

exports.PolarLines = PolarLines;
