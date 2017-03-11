"use strict";

class CartesianPoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    paper() {
        return paper.Point(this.x, this.end);
    }

    equals(other) {
        if (!other) {
            return false;
        }

        return (other.x === this.x) && (other.y === this.y);
    }

    minus(other) {
        return new CartesianPoint(this.x - other.x, this.y - other.y);
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }
}
