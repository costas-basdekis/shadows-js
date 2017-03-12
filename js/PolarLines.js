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
