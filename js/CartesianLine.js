"use strict";

class CartesianLine {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }

    closestPoint() {
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
        const segment = this.end.minus(this.start);
        if (!segment.length()) {
            return this.start;
        }

        const t = -this.start.projectOn(segment);

        if (t <= 0) {
            return this.start;
        } else if (t >= 1) {
            return this.end;
        }

        return this.start.plus(segment, t);
    }

    minDistance() {
        return this.closestPoint().length();
    }

    maxDistance() {
        return Math.max(this.start.length(), this.end.length());
    }
}
