import paper from "paper";
import { angleAlmostEquals, compareTuples, hashCode } from "./utils";
import { PolarPoint } from "./PolarPoint";
import { CartesianLine } from "./CartesianLine";
import {CartesianPoint} from "./CartesianPoint";

type Coefs = [[number, number, number], [number, number, number]];
type Solved2x2 = { x: number, y: number };

export class PolarLine {
    static maxId = 1;
    public readonly id: number;
    public sourceId: number | undefined;
    public readonly colour: string | null;
    public readonly goesOverPI: boolean;
    public start: PolarPoint;
    public end: PolarPoint;
    public closestPoint: CartesianPoint;
    public minDistanceAngle: number;
    public minDistance: number;
    public maxDistance: number;
    private _coefs: Coefs | undefined;
    private _solved2x2: Solved2x2 | undefined;

    static nextId(): number {
        const nextId = this.maxId;
        this.maxId += 1;

        return nextId;
    }

    constructor(point1: PolarPoint, point2: PolarPoint, colour: string | null=null) {
        this.id = PolarLine.nextId();

        this.colour = colour;
        const deltaAngle = Math.abs(point1.angle - point2.angle);
        if (deltaAngle <= Math.PI) {
            this.goesOverPI = false;
            if (point1.angle <= point2.angle) {
                this.start = point1;
                this.end = point2;
            } else {
                this.start = point2;
                this.end = point1;
            }
        } else {
            this.goesOverPI = true;
            if (point1.angle <= point2.angle) {
                this.start = point2;
                this.end = point1;
            } else {
                this.start = point1;
                this.end = point2;
            }
        }
        const closestPoint = new CartesianLine(
            this.start.toCartesianPoint(),
            this.end.toCartesianPoint(),
        ).closestPoint(new CartesianPoint(0, 0));
        this.closestPoint = closestPoint;
        this.minDistanceAngle = closestPoint.angle();
        this.minDistance = closestPoint.length();
        this.maxDistance = Math.max(this.start.length, this.end.length);
    }

    toString(): string {
        return `[${this.start} - ${this.end}]`;
    }

    sortKey(): [number, number, number, number] {
        return [
            this.start.angle, this.end.angle,
            this.start.length, this.end.length
        ];
    }

    sortCompare(rhs: this): number {
        return compareTuples(this.sortKey(), rhs.sortKey());
    }

    static fromCartesianLine(center: CartesianPoint, cartesianLine: CartesianLine): PolarLine {
        const hash = hashCode(`
            ${cartesianLine.start.x},${cartesianLine.start.y},
            ${cartesianLine.end.x},${cartesianLine.end.y}
        `);
        const colour = (Math.abs(hash) & 0xFFFFFF).toString(16);
        const polarLine = new PolarLine(
            PolarPoint.fromCartesianPoint(cartesianLine.start.minus(center)),
            PolarPoint.fromCartesianPoint(cartesianLine.end.minus(center)),
            colour
        );

        const closestPoint = cartesianLine.closestPoint(center);
        polarLine.closestPoint = closestPoint;
        polarLine.minDistanceAngle = closestPoint.angle();
        polarLine.minDistance = closestPoint.length();
        polarLine.maxDistance = cartesianLine.maxDistance(center);

        return polarLine;
    }

    toCartesianLine(): CartesianLine {
        return new CartesianLine(
            this.start.toCartesianPoint(),
            this.end.toCartesianPoint());
    }

    atan2(): number {
        return this.toCartesianLine().atan2();
    }

    absAtan2(): number {
        return this.toCartesianLine().absAtan2();
    }

    isCoLinear(other: this): boolean {
        if (this.sourceId && this.sourceId === other.sourceId) {
            return true;
        }

        // TODO: We still don't catch everything
        if (angleAlmostEquals(this.absAtan2(), other.absAtan2())) {
            return true;
        }

        return false;
    }

    denormalisedStartAngle(): number {
        if (this.goesOverPI) {
            return this.start.angle - 2 * Math.PI;
        } else {
            return this.start.angle;
        }
    }

    denormalisedEndAngle(): number {
        if (this.goesOverPI) {
            return this.end.angle + 2 * Math.PI;
        } else {
            return this.end.angle;
        }
    }

    containsAngle(angle: number): boolean {
        angle = PolarPoint.normaliseAngle(angle);
        if (this.goesOverPI) {
            return this.start.angle <= angle !== angle <= this.end.angle;
        } else {
            return this.start.angle <= angle && angle <= this.end.angle;
        }
    }

    strictlyContainsAngle(angle: number): boolean {
        angle = PolarPoint.normaliseAngle(angle);
        if (this.goesOverPI) {
            return this.start.angle < angle !== angle < this.end.angle;
        } else {
            return this.start.angle < angle && angle < this.end.angle;
        }
    }

    atAngles(startAngle: number, endAngle: number): this {
        const line = new (this.constructor as any)(
            new PolarPoint(startAngle, this.lengthAtAngle(startAngle)),
            new PolarPoint(endAngle, this.lengthAtAngle(endAngle))
        );
        line.sourceId = this.id;

        return line;
    }

    lengthAtAngle(angle: number): number {
        angle = PolarPoint.normaliseAngle(angle);

        if (this.start.angle === this.end.angle) {
            throw new Error("Line has no range");
        }

        if (angle === this.start.angle) {
            return this.start.length;
        } else if (angle === this.end.angle) {
            return this.end.length;
        }

        // TODO: This isn't strictly necessary, as we can extrapolate as well
        if (!this.strictlyContainsAngle(angle)) {
            throw new Error(`Angle out of range: ${angle} not in ${this}`);
        }

        return this.interpolate(angle);
    }

    static polarInterpolation(solved2x2: Solved2x2, angle: number): number {
        const {x: coCos, y: coSin} = solved2x2;

        return 1 / (coCos * Math.cos(angle) + coSin * Math.sin(angle));
    }

    interpolate(angle: number): number {
        return PolarLine.polarInterpolation(this.solved2x2, angle);
    }

    static getCoefs(startAngle: number, endAngle: number, startLength: number, endLength: number): Coefs {
        return [
            [
                Math.cos(startAngle),
                Math.sin(startAngle),
                1 / startLength,
            ],
            [
                Math.cos(endAngle),
                Math.sin(endAngle),
                1 / endLength,
            ]
        ];
    }

    get coefs(): Coefs {
        if (!this._coefs) {
            this._coefs = PolarLine.getCoefs(
                this.start.angle, this.end.angle,
                this.start.length, this.end.length);
        }

        return this._coefs;
    }

    static solve2x2(coefs: Coefs): Solved2x2 {
        const d = this.discriminate(coefs, 0, 0, 1, 1);
        const dx = this.discriminate(coefs, 0, 2, 1, 1);
        const dy = this.discriminate(coefs, 0, 0, 1, 2);

        return {
            x: dx / d,
            y: dy / d,
        };
    }

    get solved2x2(): Solved2x2 {
        if (!this._solved2x2) {
            this._solved2x2 = PolarLine.solve2x2(this.coefs);
        }

        return this._solved2x2;
    }

    static discriminate(coefs: Coefs, x1: number, y1: number, x2: number, y2: number): number {
        return coefs[x1][y1] * coefs[x2][y2] - coefs[x1][y2] * coefs[x2][y1];
    }

    deltaAngle(): number {
        return this.denormalisedEndAngle() - this.start.angle;
    }

    strictlyIntersects(other: this): boolean {
        return (
            this.start.angle === other.start.angle
            || this.end.angle === other.end.angle
            || this.strictlyContainsAngle(other.start.angle)
            || this.strictlyContainsAngle(other.end.angle)
            || other.strictlyContainsAngle(this.start.angle)
            || other.strictlyContainsAngle(this.end.angle)
        );
    }

    intersects(other: this): boolean {
        return (
            this.containsAngle(other.start.angle)
            || other.containsAngle(this.start.angle)
        );
    }

    toPath(center: CartesianPoint): paper.Path {
        const path = new paper.Path();

        const start = this.start.toPath(center);
        const end = this.end.toPath(center);

        path.moveTo(center.toPaper());
        path.lineTo(start);
        path.lineTo(end);
        path.lineTo(center.toPaper());

        if (this.colour) {
            path.fillColor = new paper.Color(`#${this.colour}`);
        }

        return path;
    }
}
