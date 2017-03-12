"use strict";

class CartesianLines {
    constructor(canvas) {
        this.canvas = canvas;
        this.lines = [];
        this.path = null;
    }

    clear() {
        this.lines = [];
    }

    updatePath() {
        if (!this.path) {
            this.path = new paper.CompoundPath();
        }
        CartesianLines.toPath(this.lines, this.path);
    }

    static toPath(lines, compoundPath=null) {
        if (!compoundPath) {
            compoundPath = new paper.CompoundPath();
        } else {
            compoundPath.children = [];
        }

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

        compoundPath.children.push(...paperPaths);

        return compoundPath;
    }

    addLine(line) {
        return this.addLines([line]);
    }

    addLines(lines) {
        this.lines.push(...lines);

        return this;
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

    static linear(...pairs) {
        const starts = pairs.slice(0, -1);
        const ends = pairs.slice(1);
        const lines = zip(starts, ends).map(
            ([[startX, startY], [endX, endY]]) => new CartesianLine(
                new CartesianPoint(startX, startY),
                new CartesianPoint(endX, endY)
            ));

        return lines
    }

    addLinear(...pairs) {
        const lines = CartesianLines.linear(...pairs);
        return this.addLines(lines);
    }
}
