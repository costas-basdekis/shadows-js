"use strict";

class PolarLine {
    // static maxId = 1;

    static nextId() {
        const nextId = this.maxId;
        this.maxId += 1;

        return nextId;
    }

    constructor(point1, point2, colour=null) {
        this.id = PolarLine.nextId();

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
        const polarLine = new PolarLine(
            PolarPoint.fromCartesianPoint(cartesianLine.start.minus(center)),
            PolarPoint.fromCartesianPoint(cartesianLine.end.minus(center)),
            colour
        );

        const closestPoint = cartesianLine.closestPoint(center);
        polarLine.closestPoint = closestPoint;
        polarLine.minDistanceAngle = closestPoint.angle();
        polarLine.minDistance = closestPoint.length();
        polarLine.maxDistance = cartesianLine.maxDistance(center);

        return polarLine;
    }

    toCartesianLine() {
        return new CartesianLine(
            this.start.toCartesianPoint(),
            this.end.toCartesianPoint());
    }

    atan2() {
        return this.toCartesianLine().atan2();
    }

    absAtan2() {
        return this.toCartesianLine().absAtan2();
    }

    isCoLinear(other) {
        if (this.sourceId && this.sourceId === other.sourceId) {
            return true;
        }

        if (this.absAtan2() === other.absAtan2()) {
            return true;
        }

        return false;
    }

    denormalisedStartAngle() {
        if (this.goesOverPI) {
            return this.start.angle - 2 * Math.PI;
        } else {
            return this.start.angle;
        }
    }

    denormalisedEndAngle() {
        if (this.goesOverPI) {
            return this.end.angle + 2 * Math.PI;
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

    atAngles(startAngle, endAngle) {
        const line = new PolarLine(
            new PolarPoint(startAngle, this.lengthAtAngle(startAngle)),
            new PolarPoint(endAngle, this.lengthAtAngle(endAngle))
        );
        line.sourceId = this.id;

        return line;
    }

    lengthAtAngle(angle) {
        angle = PolarPoint.normaliseAngle(angle);

        if (this.start.angle === this.end.angle) {
            throw new Error("Line has no range");
        }

        if (angle === this.start.angle) {
            return this.start.length;
        } else if (angle === this.end.angle) {
            return this.end.length;
        }

        // TODO: This isn't strictly necessary, as we can extrapolate as well
        if (!this.strictlyContainsAngle(angle)) {
            throw new Error(`Angle out of range: ${angle} not in ${this}`);
        }

        return PolarLine.polarInterpolation(
            this.start.angle, this.end.angle,
            this.start.length, this.end.length,
            angle);
    }

    static polarInterpolation(startAngle, endAngle, startLength, endLength, angle) {
        const coefs = this.getCoefs(startAngle, endAngle, startLength, endLength);
        const {x: coCos, y: coSin} = this.solve2x2(coefs);

        return 1 / (coCos * Math.cos(angle) + coSin * Math.sin(angle));
    }

    static getCoefs(startAngle, endAngle, startLength, endLength) {
        return [
            [
                Math.cos(startAngle),
                Math.sin(startAngle),
                1 / startLength,
            ],
            [
                Math.cos(endAngle),
                Math.sin(endAngle),
                1 / endLength,
            ]
        ];
    }

    static solve2x2(coefs) {
        const d = this.discriminate(coefs, 0, 0, 1, 1);
        const dx = this.discriminate(coefs, 0, 2, 1, 1);
        const dy = this.discriminate(coefs, 0, 0, 1, 2);

        return {
            x: dx / d,
            y: dy / d,
        };
    }

    static discriminate(coefs, x1, y1, x2, y2) {
        return coefs[x1][y1] * coefs[x2][y2] - coefs[x1][y2] * coefs[x2][y1];
    }

    deltaAngle() {
        return this.denormalisedEndAngle() - this.start.angle;
    }

    strictlyIntersects(other) {
        return (
            this.start.angle === other.start.angle
            || this.end.angle === other.end.angle
            || this.strictlyContainsAngle(other.start.angle)
            || this.strictlyContainsAngle(other.end.angle)
            || other.strictlyContainsAngle(this.start.angle)
            || other.strictlyContainsAngle(this.end.angle)
        );
    }

    intersects(other) {
        return (
            this.containsAngle(other.start.angle)
            || other.containsAngle(this.start.angle)
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

PolarLine.maxId = 1;
