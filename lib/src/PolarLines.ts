import paper from "paper";
import { PolarLine } from "./PolarLine";
import {
    compare, groupBy, sortWithCompare, sortWithCompareFunc, unique, zip,
} from "./utils";
import {CartesianPoint} from "./CartesianPoint";
import {CartesianLines} from "./CartesianLines";
import {PolarPoint} from "./PolarPoint";

export class PolarLines {
    public lines: PolarLine[];
    public path: paper.CompoundPath | null;
    public name: string | null;

    constructor(name: string | null=null) {
        this.lines = [];
        this.path = null;
        this.name = name;
    }

    clear(): void {
        this.lines = [];
    }

    fromCartesianLines(center: CartesianPoint, cartesianLines: CartesianLines): this {
        this.lines = cartesianLines.lines
            .map(line => PolarLine.fromCartesianLine(center, line))
            .filter(line => line.start.length > 0 && line.end.length > 0);
        this.name = cartesianLines.name;

        return this;
    }

    simplify(): void {
        const reachableLines: PolarLine[] = PolarLines.removeObviouslyHiddenLines(this.lines);
        const angles: number[] = PolarLines.linesAngles(reachableLines);
        const anglesInLines: number[][] = PolarLines.anglesInLines(reachableLines, angles);
        const splitLines: PolarLine[] = PolarLines.splitLines(reachableLines, anglesInLines);
        const visibleLines: PolarLine[] = PolarLines.removeHiddenLines(splitLines);
        const joinedLines: PolarLine[] = PolarLines.joinLines(visibleLines);

        this.lines = joinedLines;
    }

    static removeObviouslyHiddenLines(lines: PolarLine[]): PolarLine[] {
        const angles: number[] = PolarLines.linesAngles(lines);
        const anglePairs: [number, number][] =
            zip(angles, angles.slice(1).concat(angles.slice(0, 1)));
        const linesInAnglePairs: PolarLine[][] = anglePairs.map(
            ([start, end]) => lines.filter(
                line => line.containsAngle(start) && line.containsAngle(end)));
        const minMaxDistancePerAnglePair: number[] = linesInAnglePairs
            .map(linesInAnglePair => linesInAnglePair.map(line => line.maxDistance))
            .map((maxDistances: number[]) => Math.min(...maxDistances));
        const reachableLinesPerAnglePair = zip(linesInAnglePairs, minMaxDistancePerAnglePair)
            .map(([linesInAnglePair, minMaxDistance]) => linesInAnglePair.filter(
                line => line.minDistance <= minMaxDistance));
        const reachableLines = unique(sortWithCompareFunc(reachableLinesPerAnglePair.flat()));

        // console.log(`Hid ${lines.length - reachableLines.length} out of ${lines.length}, leaving ${reachableLines.length}`);

        return reachableLines;
    }

    static linesAngles(lines: PolarLine[]): number[] {
        const unsortedAngles = [
            ...lines.map(line => line.start.angle),
            ...lines.map(line => line.end.angle),
        ];
        const sortedAngles = sortWithCompare(unsortedAngles);
        const angles = unique(sortedAngles);
        // console.log("Angles:", angles);

        return angles;
    }

    static anglesInLines(lines: PolarLine[], angles: number[]): number[][] {
        const anglesInLines = lines
            .map(line => this.anglesInLine(line, angles));
        // for (const anglesInLine of anglesInLines) {
        //     console.log(`Line contains ${anglesInLine.length} angles: ${line.start.angle} - ${anglesInLine.join(', ')} - ${line.end.angle}`);
        // }

        return anglesInLines;
    }

    static anglesInLine(line: PolarLine, angles: number[]): number[] {
        const unsortedAnglesInLines = angles
            .filter(angle => line.strictlyContainsAngle(angle));
        let anglesInLine;
        if (!line.goesOverPI) {
            anglesInLine = unsortedAnglesInLines;
        } else {
            const positive = unsortedAnglesInLines.filter(angle => angle >= 0);
            const negative = unsortedAnglesInLines.filter(angle => angle < 0);
            anglesInLine = sortWithCompare(positive)
                .concat(sortWithCompare(negative))
        }

        return anglesInLine;
    }

    static splitLines(lines: PolarLine[], anglesInLines: number[][]): PolarLine[] {
        const splitLines = zip(lines, anglesInLines)
            .map(([line, anglesInLine]) => this.splitLine(line, anglesInLine))
            .flat()
            .filter(line => line.start.angle !== line.end.angle);
        // console.log("Split lines:", sortedSplitLines.map(line => `${line.sortKey()[0]},${line.sortKey()[1]}`));

        return splitLines;
    }

    static splitLine(line: PolarLine, anglesInLine: number[]): PolarLine[] {
        if (line.start.angle === line.end.angle) {
            return [line];
        }

        const startEndAngles =  zip(
            [line.start.angle].concat(anglesInLine),
            anglesInLine.concat([line.end.angle])
        );
        const splitLines = startEndAngles.map(
            ([startAngle, endAngle]) => line.atAngles(startAngle, endAngle));

        return splitLines;
    }

    static removeHiddenLines(lines: PolarLine[]): PolarLine[] {
        const byKey = groupBy(lines,
            line => `${line.start.angle},${line.end.angle}`);
        const groups = Object.keys(byKey).map(key => byKey[key]);

        // Instead of sorting by least lengths, we sort by least deviation from
        // shortest lengths, to account for a line's end intersecting another
        // line
        const sortFunc = this.sortLinesByLeastDeviation;
        // const = sortWithCompareFunc;

        const nonOverlapping = groups
            .map(sortFunc)
            .map(group => group[0]);

        return nonOverlapping;
    }

    static sortLinesByLeastDeviation(lines: PolarLine[]): PolarLine[] {
        // Sort the lines by least deviation from the shortest lengths. This
        // means we can avoid the issue were a line's end intersects another
        // line, and the first line has a slightly smaller length than the the
        // point on the second line, thus tolerating the shortest line to be
        // slightly more lengthy than another one, on one end.
        const shortestStartLength = lines
            .map(line => line.start.length)
            .sort(compare)
            [0];
        const shortestEndLength = lines
            .map(line => line.end.length)
            .sort(compare)
            [0];

        function deviationSortKey(line: PolarLine) {
            return Math.abs(line.start.length - shortestStartLength)
                + Math.abs(line.end.length - shortestEndLength);
        }

        function deviationCompareFunc(lhs: PolarLine, rhs: PolarLine) {
            return compare(deviationSortKey(lhs), deviationSortKey((rhs)));
        }

        const sortedLines = lines
            .sort(deviationCompareFunc);

        return sortedLines;
    }

    static joinLines(lines: PolarLine[]): PolarLine[] {
        const sorted = sortWithCompareFunc(lines);
        const joined = [];

        for (const line of sorted) {
            const previousLine: PolarLine = joined.slice(-1)[0];
            if (!previousLine) {
                joined.push(line);
                continue;
            }

            if (previousLine.isCoLinear(line)
                    && previousLine.end.almostEquals(line.start)) {
                previousLine.end = line.end;
                continue;
            }

            joined.push(line)
        }

        const firstLine = joined[0];
        const lastLine = joined.slice(-1)[0];
        if (firstLine
                && lastLine !== firstLine
                && lastLine.isCoLinear(firstLine)
                && lastLine.end.almostEquals(firstLine.start)) {
            firstLine.start = lastLine.start;
            joined.pop();
        }

        return joined;
    }

    static toPath(lines: PolarLine[], center: CartesianPoint, compoundPath: paper.CompoundPath | null=null, showRays: boolean=true): paper.CompoundPath {
        if (!compoundPath) {
            compoundPath = new paper.CompoundPath("");
        } else {
            for (const child of compoundPath.children) {
                child.remove();
            }
            compoundPath.children = [];
        }
        let paths;
        if (showRays) {
            paths = PolarLines.toPathWithRays(lines, center);
        } else {
            paths = PolarLines.toPathsWithoutRays(lines, center);
        }
        compoundPath.children.push(...paths);

        return compoundPath;
    }

    static toPathWithRays(lines: PolarLine[], center: CartesianPoint): paper.Path[] {
        return lines.map(line => line.toPath(center));
    }

    static toPathsWithoutRays(lines: PolarLine[], center: CartesianPoint): paper.Path[] {
        const polygon = this.toPolygon(lines, center);
        const path = new paper.Path();

        if (!polygon.length) {
            return [];
        }

        const start = polygon[0];
        const rest = polygon.slice(1);

        path.moveTo(start.toPaper());

        for (const point of rest) {
            path.lineTo(point.toPaper());
        }

        return [path];
    }

    static toPolygon(lines: PolarLine[], center: CartesianPoint) {
        const pointLists: [PolarPoint, CartesianPoint, boolean][][] = lines.map(line => [
            [
                line.start,
                line.start.toCartesianPoint().plus(center),
                true,
            ],
            [
                line.end,
                line.end.toCartesianPoint().plus(center),
                false,
            ],
        ])
        const points: [PolarPoint, CartesianPoint, boolean][] = pointLists.flat();

        if (!points.length) {
            return [];
        }

        const previousPoints = points.slice(-1).concat(points.slice(0, -1));
        const pointsAndPreviousPoints = zip(points, previousPoints);

        const [, end] = previousPoints[0];
        // console.log(pointsAndPreviousPoints);

        const polygon = [];

        polygon.push(end);
        // console.log(`Start on ${end}`);

        for (const [[polarPoint, point, pointIsStart],
            [previousPolarPoint, previousPoint]]
            of pointsAndPreviousPoints) {
            // console.log(`Is start? ${pointIsStart}, ${polarPoint.angle} ?== ${previousPolarPoint.angle}: ${polarPoint.angle === previousPolarPoint.angle}`)
            if (pointIsStart && polarPoint.angle !== previousPolarPoint.angle) {
                polygon.push(center);
                // console.log("Move to center");
            }
            if (!point.equals(previousPoint)) {
                polygon.push(point);
                // console.log(`Move to ${point}`);
            } else {
                // console.log(`Points are equal ${point} === ${previousPoint}`);
            }
        }

        return polygon;
    }

    updatePath(center: CartesianPoint, showRays: boolean=true): void {
        if (!this.path) {
            this.path = new paper.CompoundPath("");
        }
        PolarLines.toPath(this.lines, center, this.path, showRays);
    }
}
