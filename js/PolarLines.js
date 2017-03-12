"use strict";

class PolarLines {
    constructor() {
        this.lines = [];
        this.path = null;
    }

    clear() {
        this.lines = [];
    }

    fromCartesianLines(center, cartesianLines) {
        this.lines = cartesianLines.lines.map(
            line => PolarLine.fromCartesianLine(center, line));

        return this;
    }

    simplify() {
        const angles = PolarLines.linesAngles(this.lines);
        const anglesInLines = PolarLines.anglesInLines(this.lines, angles);
        const splitLines = PolarLines.splitLines(this.lines, anglesInLines);
        const visibleLines = PolarLines.removeHiddenLines(splitLines);
        const joinedLines = PolarLines.joinLines(visibleLines);

        this.lines = joinedLines;
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
        const nonOverlapping = groups
            .map(sortWithCompareFunc)
            .map(group => group[0]);

        return nonOverlapping;
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

            if (previousLine.sourceId
                    && previousLine.sourceId === line.sourceId
                    && previousLine.end.equals(line.start)) {
                previousLine.end = line.end;
            } else {
                joined.push(line)
            }
        }

        const firstLine = joined[0];
        const lastLine = joined.slice(-1)[0];
        if (firstLine
                && firstLine !== lastLine
                && firstLine.sourceId
                && firstLine.sourceId === lastLine.sourceId
                && lastLine.end.equals(firstLine.start)) {
            firstLine.start = lastLine.start;
            joined.pop();
        }

        return joined;
    }

    static toPath(lines, center, compoundPath=null) {
        if (!compoundPath) {
            compoundPath = new paper.CompoundPath();
        } else {
            for (const child of compoundPath.children) {
                child.remove();
            }
            compoundPath.children = [];
        }
        const paths = lines.map(line => line.toPath(center));
        compoundPath.children.push(...paths);

        return compoundPath;
    }

    updatePath(center) {
        if (!this.path) {
            this.path = new paper.CompoundPath();
        }
        PolarLines.toPath(this.lines, center, this.path);
    }
}
