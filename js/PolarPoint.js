"use strict";

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
