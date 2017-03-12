"use strict";

class PolarLine {
    constructor(point1, point2, colour=null) {
        this.colour = colour;
        const deltaAngle = Math.abs(point1.angle - point2.angle);
        if (deltaAngle <= Math.PI) {
            this.goesOverPI = false;
            if (point1.angle <= point2.angle) {
                this.start = point1;
                this.end = point2;
            } else {
                this.start = point2;
                this.end = point1;
            }
        } else {
            this.goesOverPI = true;
            if (point1.angle <= point2.angle) {
                this.start = point2;
                this.end = point1;
            } else {
                this.start = point1;
                this.end = point2;
            }
        }
    }

    toString() {
        return `[${this.start} - ${this.end}]`;
    }

    sortKey() {
        return [
            this.start.angle, this.end.angle,
            this.start.length, this.end.length
        ];
    }

    sortCompare(rhs) {
        return compareTuples(this.sortKey(), rhs.sortKey());
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

    unnormalisedStartAnlge() {
        if (this.goesOverPI) {
            return this.start.angle - 2 * Math.PI;
        } else {
            return this.start.angle;
        }
    }

    unnormalisedEndAnlge() {
        if (this.goesOverPI) {
            return this.end.angle - 2 * Math.PI;
        } else {
            return this.end.angle;
        }
    }

    containsAngle(angle) {
        angle = PolarPoint.normaliseAngle(angle);
        if (this.goesOverPI) {
            return this.start.angle <= angle !== angle <= this.end.angle;
        } else {
            return this.start.angle <= angle && angle <= this.end.angle;
        }
    }

    strictlyContainsAngle(angle) {
        angle = PolarPoint.normaliseAngle(angle);
        if (this.goesOverPI) {
            return this.start.angle < angle !== angle < this.end.angle;
        } else {
            return this.start.angle < angle && angle < this.end.angle;
        }
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
