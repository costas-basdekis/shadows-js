const { CartesianPoint } = require("./CartesianPoint");
const { almostEquals, compareTuples } = require("./utils");

class PolarPoint {
    constructor(angle, length) {
        this.angle = PolarPoint.normaliseAngle(angle);
        this.length = length;
    }

    static normaliseAngle(angle) {
        while (angle > Math.PI) {
            angle -= 2 * Math.PI;
        }
        while (angle <= -Math.PI) {
            angle += 2 * Math.PI;
        }

        return angle
    }

    toString() {
        return `{P:${this.angle}@${this.length}}`;
    }

    sortKey() {
        return [
            this.angle, this.length
        ];
    }

    sortCompare(rhs) {
        return compareTuples(this.sortKey(), rhs.sortKey());
    }

    equals(other) {
        return compareTuples(this.sortKey(), other.sortKey()) === 0;
    }

    almostEquals(other) {
        return compareTuples(this.sortKey(), other.sortKey(), almostEquals) === 0;
    }

    clockwiseAngle(angle) {
        angle = PolarPoint.normaliseAngle(angle);

        if (angle >= this.angle) {
            return angle - this.angle;
        }

        return 2 * Math.PI + angle - this.angle
    }

    static fromCartesianPoints(center, point) {
        const delta = point.minus(center);
        return this.fromCartesianPoint(delta);
    }

    static fromCartesianPoint(point) {
        return new this(point.angle(), point.length());
    }

    toCartesianPoint() {
        return new CartesianPoint(
            Math.cos(this.angle) * this.length,
            Math.sin(this.angle) * this.length);
    }

    toPath(center) {
        return this.toCartesianPoint().plus(center).toPaper();
    }
}

exports.PolarPoint = PolarPoint;
