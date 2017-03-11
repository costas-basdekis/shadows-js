"use strict";

class CartesianLines {
    constructor(canvas) {
        this.canvas = canvas;
        this.lines = [];
        this.path = null;
    }

    updatePath() {
        if (this.path) {
            this.path.remove();
        }

        this.path = CartesianLines.linesToPath(this.lines);
    }

    static linesToPath(lines) {
        const paths = [];

        for (const line of lines) {
            const previousPath = paths.length ? paths[paths.length - 1] : null;
            const previousLine = previousPath ? previousPath[previousPath.length - 1] : null;
            const previousPoint = previousLine ? previousLine.end : null;
            const path = line.start.equals(previousPoint) ? previousPath : [];
            if (path !== previousPath) {
                paths.push(path);
            }
            path.push(line);
        }

        const paperPaths = [];

        for (const path of paths) {
            const paperPath = new paper.Path();
            paperPaths.push(paperPath);

            paperPath.moveTo(path[0].start);
            for (const line of path) {
                paperPath.lineTo(line.end);
            }
        }

        const compoundPath = new paper.CompoundPath();
        compoundPath.children.push(...paperPaths);

        return compoundPath;
    }

    addLine(line) {
        return this.addLines([line]);
    }

    addLines(lines) {
        this.lines.push(...lines);

        return lines;
    }

    static box(first, third) {
        const second = new CartesianPoint(third.x, first.y);
        const fourth = new CartesianPoint(first.x, third.y);
        return [
            new CartesianLine(first, second),
            new CartesianLine(second, third),
            new CartesianLine(third, fourth),
            new CartesianLine(fourth, first),
        ];
    }

    addBox(first, third) {
        const lines = CartesianLines.box(first, third);
        return this.addLines(lines);
    }
}
