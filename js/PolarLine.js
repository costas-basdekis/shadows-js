"use strict";

class PolarLine {
    constructor(point1, point2) {
        const deltaAngle = Math.abs(point1.angle - point2.angle);
        if (deltaAngle <= Math.PI) {
            if (point1.angle <= point2.angle) {
                this.start = point1;
                this.end = point2;
            } else {
                this.start = point2;
                this.end = point1;
            }
        } else {
            if (point1.angle <= point2.angle) {
                this.start = point2;
                this.end = point1;
            } else {
                this.start = point1;
                this.end = point2;
            }
        }
    }
}
