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
        const lines = PolarLines.removeHiddenLines(splitLines);

        this.lines = lines;
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
            .map(([line, anglesInLine]) => this.splitLine(line, anglesInLine)));
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
        const keys = {};

        for (const line of lines) {
            const key = `${line.start.angle},${line.end.angle}`;
            if (!(key in keys)) {
                keys[key] = [];
            }
            keys[key].push(line);
        }

        const nonOverlapping = [];
        for (const key in keys) {
            const overlapping = keys[key];
            if (overlapping.length === 1) {
                nonOverlapping.push(overlapping[0]);
                continue;
            }

            const sorted = sortWithCompareFunc(overlapping);
            nonOverlapping.push(sorted[0]);
        }

        return nonOverlapping;
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
