"use strict";

class PolarLines {
    constructor() {
        this.lines = [];
        this.path = new paper.CompoundPath();
    }

    clear() {
        this.lines = [];
    }

    fromCartesianLines(center, cartesianLines) {
        this.lines = cartesianLines.lines.map(
            line => PolarLine.fromCartesianLine(center, line));
    }

    static toPath(lines, center, compoundPath=null) {
        if (!compoundPath) {
            compoundPath = new paper.CompoundPath();
        } else {
            compoundPath.children = [];
        }
        const paths = lines.map(line => line.toPath(center));
        compoundPath.children.push(...paths);

        return compoundPath;
    }

    updatePath(center) {
        PolarLines.toPath(this.lines, center, this.path);
    }
}
