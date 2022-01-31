import paper from "paper";
import { range, zip } from "./utils";
import { CartesianLine } from "./CartesianLine";
import { CartesianPoint } from "./CartesianPoint";

export class CartesianLines {
    private readonly canvas: HTMLCanvasElement | null;
    public lines: CartesianLine[];
    public path: paper.CompoundPath | null;
    public readonly name: string | null;

    constructor(canvas: HTMLCanvasElement | null=null, name: string | null=null) {
        this.canvas = canvas;
        this.lines = [];
        this.path = null;
        this.name = name;
    }

    clear(): void {
        this.lines = [];
    }

    updatePath(): void {
        if (!this.path) {
            this.path = new paper.CompoundPath("");
        }
        CartesianLines.toPath(this.lines, this.path);
    }

    clearPath(): void {
        if (!this.path) {
            this.path = new paper.CompoundPath("");
        }
        CartesianLines.toPath([], this.path);
    }

    static toPath(lines: CartesianLine[], compoundPath: paper.CompoundPath | null=null) {
        if (!compoundPath) {
            compoundPath = new paper.CompoundPath("");
        } else {
            compoundPath.children = [];
        }

        const paths: CartesianLine[][] = [];

        for (const line of lines) {
            const previousPath: CartesianLine[] | null = paths.length ? paths[paths.length - 1] : null;
            const previousLine: CartesianLine | null = previousPath ? previousPath[previousPath.length - 1] : null;
            const previousPoint: CartesianPoint | null = previousLine ? previousLine.end : null;
            const path: CartesianLine[] = line.start.equals(previousPoint) ? previousPath! : [];
            if (path !== previousPath) {
                paths.push(path);
            }
            path.push(line);
        }

        const paperPaths: paper.Path[] = [];

        for (const path of paths) {
            const paperPath = new paper.Path();
            paperPaths.push(paperPath);

            paperPath.moveTo(path[0].start.toPaper());
            for (const line of path) {
                paperPath.lineTo(line.end.toPaper());
            }
        }

        compoundPath.children.push(...paperPaths);

        return compoundPath;
    }

    addLine(line: CartesianLine): this {
        return this.addLines([line]);
    }

    addLines(lines: CartesianLine[]): this {
        this.lines.push(...lines);

        return this;
    }

    static box(first: CartesianPoint, third: CartesianPoint): CartesianLine[] {
        const second = new CartesianPoint(third.x, first.y);
        const fourth = new CartesianPoint(first.x, third.y);
        return [
            new CartesianLine(first, second),
            new CartesianLine(second, third),
            new CartesianLine(third, fourth),
            new CartesianLine(fourth, first),
        ];
    }

    addBox(first: CartesianPoint, third: CartesianPoint): this {
        const lines = CartesianLines.box(first, third);
        return this.addLines(lines);
    }

    static linear(...pairs: [number, number][]): CartesianLine[] {
        const starts = pairs.slice(0, -1);
        const ends = pairs.slice(1);
        const lines: CartesianLine[] = zip(starts, ends).map(
            ([[startX, startY], [endX, endY]]: [[number, number], [number, number]]) => new CartesianLine(
                new CartesianPoint(startX, startY),
                new CartesianPoint(endX, endY)
            ));

        return lines
    }

    addLinear(...pairs: [number, number][]): this {
        const lines = CartesianLines.linear(...pairs);
        return this.addLines(lines);
    }

    static regularPolygon(center: CartesianPoint, radius: number, count: number): CartesianLine[] {
        const angles = range(0, count + 1)
            .map(i => i * Math.PI * 2 / count);
        const points: [number, number][] = angles.map(angle => [
            Math.cos(angle) * radius + center.x,
            Math.sin(angle) * radius + center.y
        ]);
        // Make sure the first and last points are truly the same
        points[points.length - 1] = points[0];

        return this.linear(...points);
    }

    addRegularPolygon(center: CartesianPoint, radius: number, count: number): this {
        const lines = CartesianLines.regularPolygon(center, radius, count);
        return this.addLines(lines);
    }

    static star(center: CartesianPoint, smallRadius: number, bigRadius: number, count: number): CartesianLine[] {
        const angles = range(0, (count + 1) * 2)
            .map(i => i * Math.PI * 2 / (count * 2));
        const radiuses = range(0, (count + 1) * 2)
            .map(i => (i % 2) ? smallRadius : bigRadius);
        const points: [number, number][] = zip(angles, radiuses)
            .map(([angle, radius]: [number, number]) => [
                Math.cos(angle) * radius + center.x,
                Math.sin(angle) * radius + center.y
            ]);
        // Make sure the first and last points are truly the same
        points[points.length - 1] = points[0];

        return this.linear(...points);
    }

    addStar(center: CartesianPoint, smallRadius: number, bigRadius: number, count: number): this {
        const lines: CartesianLine[] = CartesianLines.star(center, smallRadius, bigRadius, count);
        return this.addLines(lines);
    }
}
