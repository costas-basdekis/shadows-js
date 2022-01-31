import { cartesian, randomPop, range, zip } from "./utils";

type RawPoint = {
    x: number,
    y: number,
};

export class Maze {
    private readonly width: number;
    private readonly height: number;
    private readonly points: boolean[][];
    private readonly verticalWalls: boolean[][];
    private readonly horizontalWalls: boolean[][];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.points = Array.from({length: this.height},
            () => Array.from({length: this.width}, () => false));
        this.verticalWalls = Array.from({length: this.height},
            () => Array.from({length: this.width - 1}, () => true));
        this.horizontalWalls = Array.from({length: this.height - 1},
            () => Array.from({length: this.width}, () => true));

        this.generate();
    }

    toString(): string {
        const verticalWallsRows: string[] = zip(this.points, this.verticalWalls)
            .map(([points, walls]: [boolean[], boolean[]]) =>
                zip(points, walls.concat([true])).map(
                    ([point, wall]: [boolean, boolean]) => `${point ? ' ' : 'x'}${wall ? '|' : ' '}`
                ).join(''));
        const horizontalWallsRows: string[] = this.horizontalWalls.map(walls =>
            walls.map(wall =>
                `${wall ?  '-' : ' '} `
            ).join(''));
        return zip(verticalWallsRows, horizontalWallsRows.concat(['']))
            .map(([v, h]: [string, string]) => `|${v}\n ${h}`).join('\n');
    }

    generate(): void {
        const start: RawPoint = {
            x: Math.floor(this.width / 2),
            y: Math.floor(this.width / 2),
        };

        const border: RawPoint[] = [start];
        this.takePoint(start);
        // console.log(`Seeding with ${start.x}x${start.y}:\n${this}`);
        while (border.length) {
            const point: RawPoint = randomPop(border)!;
            // console.log(`Got ${point.x}x${point.y}`);
            const unclaimedNeighboursAndWalls: [RawPoint, RawPoint | null, RawPoint | null][] =
                this.getUnclaimedNeighboursAndWalls(point);
            // console.log(`Got unclaimed neighbours: ${unclaimedNeighboursAndWalls.map(([p, _1, _2]) => `${p.x}x${p.y}`)}`);
            if (!unclaimedNeighboursAndWalls.length) {
                continue;
            }

            const [nextPoint, nextVerticalWall, nextHorizontalWall]: [RawPoint, RawPoint | null, RawPoint | null] =
                randomPop(unclaimedNeighboursAndWalls)!;
            // console.log(`Claim ${nextPoint.x}x${nextPoint.y}`);
            this.takePoint(nextPoint);
            if (nextVerticalWall) {
                this.openVerticalWall(nextVerticalWall);
            } else {
                this.openHorizontalWall(nextHorizontalWall!);
            }
            border.push(nextPoint);

            // console.log(`Maze now is:\n${this}`);

            if (unclaimedNeighboursAndWalls.length) {
                border.push(point);
            }
        }
    }

    getUnclaimedNeighboursAndWalls(point: RawPoint): [RawPoint, RawPoint | null, RawPoint | null][] {
        const neighboursAndWalls: [RawPoint, RawPoint | null, RawPoint | null][] = this.getNeighboursAndWalls(point);
        // console.log(`Neighbours of ${point.x}x${point.y}: ${neighboursAndWalls.map(([p, _]) => `${p.x}x${p.y}`)}`);
        const unclaimedNeighboursAndWalls: [RawPoint, RawPoint | null, RawPoint | null][] = neighboursAndWalls
            .filter(([point]) => !this.pointIsTaken(point));
        return unclaimedNeighboursAndWalls;
    }

    getNeighboursAndWalls(point: RawPoint): [RawPoint, RawPoint | null, RawPoint | null][] {
        const neighboursAndWalls: [RawPoint, RawPoint | null, RawPoint | null][] = [
            [{x: point.x - 1, y: point.y}, {x: point.x - 1, y: point.y}, null],
            [{x: point.x + 1, y: point.y}, {x: point.x, y: point.y}, null],
            [{x: point.x, y: point.y - 1}, null, {x: point.x, y: point.y - 1}],
            [{x: point.x, y: point.y + 1}, null, {x: point.x, y: point.y}],
        ];
        // console.log(`Trying neighbours of ${point.x}x${point.y}: ${neighboursAndWalls.map(([p, _]) => `${p.x}x${p.y}`)}`);
        const existingNeighboursAndWalls: [RawPoint, RawPoint | null, RawPoint | null][] = neighboursAndWalls
            .filter(([point]) => this.pointExists(point));
        return existingNeighboursAndWalls;
    }

    pointExists(point: RawPoint): boolean {
        // console.log(`Exists ${point.x}x${point.y}? ${point.x >= 0} && ${point.x < this.width}
        //         && ${point.y >= 0} && ${point.y < this.height}`)
        return point.x >= 0 && point.x < this.width
                && point.y >= 0 && point.y < this.height;
    }

    takePoint(point: RawPoint): void {
        this.points[point.y][point.x] = true;
    }

    pointIsTaken(point: RawPoint): boolean {
        return this.points[point.y][point.x];
    }

    openVerticalWall(wall: RawPoint): void {
        this.verticalWalls[wall.y][wall.x] = false;
    }

    openHorizontalWall(wall: RawPoint): void {
        this.horizontalWalls[wall.y][wall.x] = false;
    }

    verticalWallIsClosed(wall: RawPoint): boolean {
        return this.verticalWalls[wall.y][wall.x];
    }

    horizontalWallIsClosed(wall: RawPoint): boolean {
        return this.horizontalWalls[wall.y][wall.x];
    }

    toCoordinatesLists(size: number, offsetX: number=0, offsetY: number=0): [number, number][][] {
        const borderList: [number, number][] = [
            // Top, going right: [0, 0] -> [width - 1, 0]
            ...range(this.width)
                .map(index => [index, 0]) as [number, number][],
            // Right, going down: [width, 0] - > [width, height - 1]
            ...range(this.height)
                .map(index => [this.width, index]) as [number, number][],
            // Bottom, going left: [width, height] -> [1, height]
            ...range(this.width, 0, -1)
                .map(index => [index, this.height]) as [number, number][],
            // Left, going up: [0, height] -> [0, 1]
            ...range(this.height, 0, -1)
                .map(index => [0, index]) as [number, number][],
        ];
        borderList.push(borderList[0]);
        const borderLists: [number, number][][] = [borderList];
        const verticalWallsLists: [number, number][][] =
            cartesian(range(this.width - 1), range(this.height))
                .filter(([x, y]: [number, number]) => this.verticalWallIsClosed({x, y}))
                .map(([x, y]: [number, number]) => [[x + 1, y], [x + 1, y + 1]]);
        const horizontalWallsLists: [number, number][][] =
            cartesian(range(this.width), range(this.height - 1))
                .filter(([x, y]: [number, number]) => this.horizontalWallIsClosed({x, y}))
                .map(([x, y]: [number, number]) => [[x, y + 1], [x + 1, y + 1]]);
        const lists: [number, number][][] = [
            ...borderLists,
            ...verticalWallsLists,
            ...horizontalWallsLists,
        ];
        const coordinatesLists: [number, number][][] = lists
            .map(list => list
                .map(([x, y]) => [offsetX + x * size, offsetY + y * size]));

        return coordinatesLists;
    }
}
