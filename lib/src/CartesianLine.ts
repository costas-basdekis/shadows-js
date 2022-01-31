import {CartesianPoint} from "./CartesianPoint";

export class CartesianLine {
    public start: CartesianPoint;
    public end: CartesianPoint;

    constructor(start: CartesianPoint, end: CartesianPoint) {
        this.start = start;
        this.end = end;
    }

    toString(): string {
        return `[${this.start} - ${this.end}]`;
    }

    plus(point: CartesianPoint, multiplier: number=1): this {
        return new (this.constructor as any)(
            this.start.plus(point, multiplier),
            this.end.plus(point, multiplier)
        );
    }

    atan2(): number {
        const segment = this.end.minus(this.start);
        return Math.atan2(segment.y, segment.x);
    }

    absAtan2(): number {
        const atan2 = this.atan2();
        return atan2 >= 0 ? atan2 : Math.PI + atan2;
    }

    closestPoint(point: CartesianPoint): CartesianPoint {
        // The projectOn of point point onto a line is the point on the line
        // closest to point. (And a perpendicular to the line at the projectOn
        // will pass through point.)
        //
        // The number t is how far along the line segment from start to end that
        // the projectOn falls. So if t is 0 the projectOn falls right on the
        // start; if it's 1, it's on the end; if it's 0.5, for example, then
        // it's halfway between.
        //
        // If t is less than 0 or greater than 1 it falls on the line past one
        // end or the other of the segment. In that case the distance to the
        // segment will be the distance to the nearer end.
        const start: CartesianPoint = this.start.minus(point);
        const end: CartesianPoint = this.end.minus(point);
        const segment: CartesianPoint = end.minus(start);
        if (!segment.length()) {
            return start;
        }

        const t: number = -start.projectOn(segment);

        if (t <= 0) {
            return start;
        } else if (t >= 1) {
            return end;
        }

        return start.plus(segment, t);
    }

    minDistance(point: CartesianPoint): number {
        return this.closestPoint(point).length();
    }

    maxDistance(point: CartesianPoint): number {
        return Math.max(this.start.minus(point).length(), this.end.minus(point).length());
    }
}
