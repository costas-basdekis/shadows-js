"use strict";

class PolarLine {
    constructor(point1, point2, colour=null) {
        this.colour = colour;
        const deltaAngle = Math.abs(point1.angle - point2.angle);
        if (deltaAngle <= Math.PI) {
            if (point1.angle <= point2.angle) {
                this.start = point1;
                this.end = point2;
            } else {
                this.start = point2;
                this.end = point1;
            }
        } else {
            if (point1.angle <= point2.angle) {
                this.start = point2;
                this.end = point1;
            } else {
                this.start = point1;
                this.end = point2;
            }
        }
    }

    static fromCartesianLine(center, cartesianLine) {
        const hash = hashCode(`
            ${cartesianLine.start.x},${cartesianLine.start.y},
            ${cartesianLine.end.x},${cartesianLine.end.y}
        `);
        const colour = (Math.abs(hash) & 0xFFFFFF).toString(16);
        return new PolarLine(
            PolarPoint.fromCartesianPoint(cartesianLine.start.minus(center)),
            PolarPoint.fromCartesianPoint(cartesianLine.end.minus(center)),
            colour
        );
    }

    toPath(center) {
        const path = new paper.Path();

        const start = this.start.toPath(center);
        const end = this.end.toPath(center);

        path.moveTo(center);
        path.lineTo(start);
        path.lineTo(end);
        path.lineTo(center);

        if (this.colour) {
            path.fillColor = `#${this.colour}`;
        }

        return path;
    }
}
