const paper = typeof window === typeof undefined ? null : require("./lib/paper-full-v0.10.3");

class CartesianPoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return `{C:${this.x},${this.y}}`;
    }

    equals(other) {
        if (!other) {
            return false;
        }

        return (other.x === this.x) && (other.y === this.y);
    }

    plus(other, multiplier=1) {
        return new CartesianPoint(
            this.x + other.x * multiplier,
            this.y + other.y * multiplier);
    }

    minus(other, multiplier=1) {
        return this.plus(other, -multiplier);
    }

    dot(other) {
        return this.x * other.x + this.y * other.y;
    }

    projectOn(other) {
        return other.dot(this) / other.length();
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }

    toPaper() {
        return new paper.Point(this.x, this.y);
    }
}

exports.CartesianPoint = CartesianPoint;
