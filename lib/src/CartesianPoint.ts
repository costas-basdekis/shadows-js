import paper from "paper";

export class CartesianPoint {
    public readonly x: number;
    public readonly y: number;

    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    toString(): string {
        return `{C:${this.x},${this.y}}`;
    }

    equals(other: this | null): boolean {
        if (!other) {
            return false;
        }

        return (other.x === this.x) && (other.y === this.y);
    }

    plus(other: this, multiplier: number=1): this {
        return new (this.constructor as any)(
            this.x + other.x * multiplier,
            this.y + other.y * multiplier);
    }

    minus(other: this, multiplier: number=1): this {
        return this.plus(other, -multiplier);
    }

    dot(other: this): number {
        return this.x * other.x + this.y * other.y;
    }

    projectOn(other: this): number {
        return other.dot(this) / other.length();
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    angle(): number {
        return Math.atan2(this.y, this.x);
    }

    toPaper(): paper.Point {
        return new paper.Point(this.x, this.y);
    }
}
