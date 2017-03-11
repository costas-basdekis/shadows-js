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
}
