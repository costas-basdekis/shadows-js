import { CartesianLines } from "./CartesianLines";
import { CartesianPoint } from "./CartesianPoint";
import { Maze } from "./Maze";
import { cartesian, range } from "./utils";
import {CartesianLine} from "./CartesianLine";

export class Rooms {
    static rooms: (typeof Room)[] = [];
    static roomsByName: { [name: string]: (typeof Room) } = {};

    static populateComboBox(element: HTMLSelectElement): void {
        for (const room of this.rooms) {
            const optionHTML = `<option value="${room.name}">${room.label}</option>`;
            const optionElement = document.createElement('option');
            element.appendChild(optionElement);
            optionElement.outerHTML = optionHTML;
        }
    }

    static register(room: typeof Room): typeof Room {
        this.rooms.push(room);
        this.roomsByName[room.name] = room;
        return room;
    }

    static registerD = this.register.bind(this);
}

export class Room {
    static label: string;
    static isSlow: boolean = false;
    private readonly width: number;
    private readonly height: number;
    private readonly marginX: number;
    private readonly marginY: number;
    public readonly name: string;

    constructor(width: number=660, height: number=660, marginX: number=10, marginY: number=10, name: string | null=null) {
        this.width = width;
        this.height = height;
        this.marginX = marginX;
        this.marginY = marginY;
        this.name = name || this.constructor.name;
    }

    createBoundary(): CartesianLine[] {
        return CartesianLines.box(
            new CartesianPoint(this.marginX, this.marginY),
            new CartesianPoint(this.width - this.marginX, this.height - this.marginY)
        );
    }

    create(): CartesianLine[] {
        throw new Error("Abstract method `Room.create` must be overridden");
    }

    createLines(canvas: HTMLCanvasElement | null=null): CartesianLines {
        const lines = new CartesianLines(canvas, this.name);
        lines.addLines(this.create());

        return lines
    }
}

@Rooms.registerD
export class RandomMazeRoom extends Room {
    static label = "Random maze";

    create(): CartesianLine[] {
        const maze = new Maze(20, 20);
        // console.log(`${maze}`);
        const mazeCoordinatesLists = maze.toCoordinatesLists(40, 20, 20);
        const mazePointsLists = mazeCoordinatesLists
            .map(list => CartesianLines.linear(...list));
        return mazePointsLists.flat();
    }
}

@Rooms.registerD
export class MazeRoom extends Room {
    static label = "Maze";

    create(): CartesianLine[] {
        return [
            ...this.createBoundary(),
            ...CartesianLines.linear(
                [100, 100],
                [100, 450]
            ),
            ...CartesianLines.linear(
                [450, 100],
                [200, 100],
                [200, 350]
            ),
            ...CartesianLines.linear(
                [425, 125],
                [225, 325]
            ),
            ...CartesianLines.linear(
                [350, 250],
                [350, 450]
            ),
        ];
    }
}

Rooms.registerD(MazeRoom);
export class Maze2Room extends Room {
    static label = "Maze 2";

    create(): CartesianLine[] {
        return [
            ...this.createBoundary(),
            ...CartesianLines.linear(
                [200, 200],
                [200, 300]
            ),
            ...CartesianLines.linear(
                [150, 150],
                [350, 150]
            ),
            ...CartesianLines.linear(
                [450, 150],
                [150, 450]
            ),
            ...CartesianLines.linear(
                [300, 350],
                [375, 425]
            ),
            ...CartesianLines.linear(
                [375, 425],
                [450, 500]
            ),
            ...CartesianLines.linear(
                [350, 300],
                [500, 450]
            ),
            ...CartesianLines.linear(
                [375, 425],
                [275, 525]
            ),
        ];
    }
}

Rooms.registerD(Maze2Room);
export class ShapesRoom extends Room {
    static label = "Polygons and Stars";

    create(): CartesianLine[] {
        return [
            ...this.createBoundary(),
            ...CartesianLines.regularPolygon(new CartesianPoint(400, 400), 50, 3),
            ...CartesianLines.regularPolygon(new CartesianPoint(200, 300), 50, 6),
            ...CartesianLines.regularPolygon(new CartesianPoint(400, 200), 50, 5),
            ...CartesianLines.star(new CartesianPoint(200, 500), 35, 65, 7),
        ];
    }
}

@Rooms.registerD
export class Shapes2Room extends Room {
    static label = "More Polygons and Stars";

    create(): CartesianLine[] {
        const indexesAndCenters: [number, CartesianPoint][] = cartesian(range(0, 3), range(0, 3))
            .map(([i, j]) => [
                i * 3 + j,
                new CartesianPoint(10 + 640 / 3 * (j + 0.5), 10 + 640 / 3 * (i + 0.5)),
            ]);
        return [
            ...this.createBoundary(),
            ...indexesAndCenters
                .map(([count, center]) =>
                    count % 2 ?
                        CartesianLines.regularPolygon(center, 25, count % 4 + 8)
                        : CartesianLines.star(center, 15, 25, count % 4 + 8)).flat()
        ];
    }
}

@Rooms.registerD
export class Shapes3Room extends Room {
    static label = "Even More Polygons and Stars";
    static isSlow = true;

    create(): CartesianLine[] {
        const indexesAndCenters: [number, CartesianPoint][] = cartesian(range(0, 6), range(0, 6))
            .map(([i, j]) => [
                i * 3 + j,
                new CartesianPoint(10 + 640 / 6 * (j + 0.5), 10 + 640 / 6 * (i + 0.5)),
            ]);
        return [
            ...this.createBoundary(),
            ...indexesAndCenters.map(([count, center]) =>
                    count % 2 ?
                        CartesianLines.regularPolygon(center, 25, count % 4 + 8)
                        : CartesianLines.star(center, 15, 25, count % 4 + 8)).flat()
        ];
    }
}
