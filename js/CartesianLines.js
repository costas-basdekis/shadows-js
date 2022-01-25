const paper = require("./lib/paper-full-v0.10.3");
const { range, zip } = require("./utils");
const { CartesianLine } = require("./CartesianLine");
const { CartesianPoint } = require("./CartesianPoint");

class CartesianLines {
    constructor(canvas, name=null) {
        this.canvas = canvas;
        this.lines = [];
        this.path = null;
        this.name = name;
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

    clearPath() {
        if (!this.path) {
            this.path = new paper.CompoundPath();
        }
        CartesianLines.toPath([], this.path);
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

    static regularPolygon(center, radius, count) {
        const angles = range(0, count + 1)
            .map(i => i * Math.PI * 2 / count);
        const points = angles.map(angle => [
            Math.cos(angle) * radius + center.x,
            Math.sin(angle) * radius + center.y
        ]);
        // Make sure the first and last points are truly the same
        points[points.length - 1] = points[0];

        return this.linear(...points);
    }

    addRegularPolygon(center, radius, count) {
        const lines = CartesianLines.regularPolygon(center, radius, count);
        return this.addLines(lines);
    }

    static star(center, smallRadius, bigRadius, count) {
        const angles = range(0, (count + 1) * 2)
            .map(i => i * Math.PI * 2 / (count * 2));
        const radiuses = range(0, (count + 1) * 2)
            .map(i => (i % 2) ? smallRadius : bigRadius);
        const points = zip(angles, radiuses)
            .map(([angle, radius]) => [
                Math.cos(angle) * radius + center.x,
                Math.sin(angle) * radius + center.y
            ]);
        // Make sure the first and last points are truly the same
        points[points.length - 1] = points[0];

        return this.linear(...points);
    }

    addStar(center, smallRadius, bigRadius, count) {
        const lines = CartesianLines.star(center, smallRadius, bigRadius, count);
        return this.addLines(...lines);
    }
}

exports.CartesianLines = CartesianLines;
