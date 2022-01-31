import { CartesianPoint } from "./CartesianPoint";
import { almostEquals, compareTuples } from "./utils";

export class PolarPoint {
    public readonly angle: number;
    public readonly length: number;

    constructor(angle: number, length: number) {
        this.angle = PolarPoint.normaliseAngle(angle);
        this.length = length;
    }

    static normaliseAngle(angle: number): number {
        while (angle > Math.PI) {
            angle -= 2 * Math.PI;
        }
        while (angle <= -Math.PI) {
            angle += 2 * Math.PI;
        }

        return angle
    }

    toString(): string {
        return `{P:${this.angle}@${this.length}}`;
    }

    sortKey(): [number, number] {
        return [
            this.angle, this.length
        ];
    }

    sortCompare(rhs: this): number {
        return compareTuples(this.sortKey(), rhs.sortKey());
    }

    equals(other: this): boolean {
        return compareTuples(this.sortKey(), other.sortKey()) === 0;
    }

    almostEquals(other: this): boolean {
        return compareTuples(this.sortKey(), other.sortKey(), almostEquals) === 0;
    }

    clockwiseAngle(angle: number): number {
        angle = PolarPoint.normaliseAngle(angle);

        if (angle >= this.angle) {
            return angle - this.angle;
        }

        return 2 * Math.PI + angle - this.angle
    }

    static fromCartesianPoints(center: CartesianPoint, point: CartesianPoint): PolarPoint {
        const delta = point.minus(center);
        return this.fromCartesianPoint(delta);
    }

    static fromCartesianPoint(point: CartesianPoint): PolarPoint {
        return new this(point.angle(), point.length());
    }

    toCartesianPoint(): CartesianPoint {
        return new CartesianPoint(
            Math.cos(this.angle) * this.length,
            Math.sin(this.angle) * this.length);
    }

    toPath(center: CartesianPoint): paper.Point {
        return this.toCartesianPoint().plus(center).toPaper();
    }
}
