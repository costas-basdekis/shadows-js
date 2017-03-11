"use strict";

class PolarPoint {
    constructor(angle, length) {
        this.angle = angle;
        this.length = length;
    }

    static fromCartesianPoints(center, point) {
        const delta = point.minus(center);
        return this.fromCartesianPoint(delta);
    }

    static fromCartesianPoint(point) {
        return new this(point.angle(), point.length());
    }
}
