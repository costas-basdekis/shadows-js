const { CartesianLines } = require("./CartesianLines");
const { CartesianPoint } = require("./CartesianPoint");
const { Maze } = require("./Maze");
const { cartesian, range } = require("./utils");

class Rooms {
    static populateComboBox(element) {
        for (const room of this.rooms) {
            const optionHTML = `<option value="${room.name}">${room.label}</option>`;
            const optionElement = document.createElement('option');
            element.appendChild(optionElement);
            optionElement.outerHTML = optionHTML;
        }
    }

    static register(room) {
        if (!this.rooms) {
            this.rooms = [];
            this.roomsByName = {};
        }

        this.rooms.push(room);
        this.roomsByName[room.name] = room;
    }
}

class Room {
    constructor(width=660, height=660, marginX=10, marginY=10, name=null) {
        this.width = width;
        this.height = height;
        this.marginX = marginX;
        this.marginY = marginY;
        this.name = name || this.constructor.name;
    }

    createBoundary() {
        return CartesianLines.box(
            new CartesianPoint(this.marginX, this.marginY),
            new CartesianPoint(this.width - this.marginX, this.height - this.marginY)
        );
    }

    create() {
        throw new Error("Abstract method `Room.create` must be overridden");
    }

    createLines(canvas) {
        const lines = new CartesianLines(canvas, this.name);
        lines.addLines(this.create());
        lines.name = this.name;

        return lines
    }
}

Room.label = null;
Room.isSlow = false;

class RandomMazeRoom extends Room {
    create() {
        const maze = new Maze(20, 20);
        // console.log(`${maze}`);
        const mazeCoordinatesLists = maze.toCoordinatesLists(40, 20, 20);
        const mazePointsLists = mazeCoordinatesLists
            .map(list => CartesianLines.linear(...list));
        return [].concat(
            ...mazePointsLists
        );
    }
}

Rooms.register(RandomMazeRoom);
RandomMazeRoom.label = "Random maze";

class MazeRoom extends Room {
    create() {
        return [].concat(
            this.createBoundary(),
            CartesianLines.linear(
                [100, 100],
                [100, 450]
            ),
            CartesianLines.linear(
                [450, 100],
                [200, 100],
                [200, 350]
            ),
            CartesianLines.linear(
                [425, 125],
                [225, 325]
            ),
            CartesianLines.linear(
                [350, 250],
                [350, 450]
            )
        );
    }
}

Rooms.register(MazeRoom);
MazeRoom.label = "Maze";

class Maze2Room extends Room {
    create() {
        return [].concat(
            this.createBoundary(),
            CartesianLines.linear(
                [200, 200],
                [200, 300]
            ),
            CartesianLines.linear(
                [150, 150],
                [350, 150]
            ),
            CartesianLines.linear(
                [450, 150],
                [150, 450]
            ),
            CartesianLines.linear(
                [300, 350],
                [375, 425]
            ),
            CartesianLines.linear(
                [375, 425],
                [450, 500]
            ),
            CartesianLines.linear(
                [350, 300],
                [500, 450]
            ),
            CartesianLines.linear(
                [375, 425],
                [275, 525]
            )
        );
    }
}

Rooms.register(Maze2Room);
Maze2Room.label = "Maze 2";

class ShapesRoom extends Room {
    create() {
        return [].concat(
            this.createBoundary(),
            CartesianLines.regularPolygon({x: 400, y: 400}, 50, 3),
            CartesianLines.regularPolygon({x: 200, y: 300}, 50, 6),
            CartesianLines.regularPolygon({x: 400, y: 200}, 50, 5),
            CartesianLines.star({x: 200, y: 500}, 35, 65, 7)
        );
    }
}

Rooms.register(ShapesRoom);
ShapesRoom.label = "Polygons and Stars";

class Shapes2Room extends Room {
    create() {
        return [].concat(
            this.createBoundary(),
            ...cartesian(range(0, 3), range(0, 3))
                .map(([i, j]) => [
                    i * 3 + j,
                    {x: 10 + 640 / 3 * (j + 0.5), y: 10 + 640 / 3 * (i + 0.5)}
                ])
                .map(([count, center]) =>
                    count % 2 ?
                        CartesianLines.regularPolygon(center, 25, count % 4 + 8)
                        : CartesianLines.star(center, 15, 25, count % 4 + 8))
        );
    }
}

Rooms.register(Shapes2Room);
Shapes2Room.label = "More Polygons and Stars";

class Shapes3Room extends Room {
    create() {
        return [].concat(
            this.createBoundary(),
            ...cartesian(range(0, 6), range(0, 6))
                .map(([i, j]) => [
                    i * 3 + j,
                    {x: 10 + 640 / 6 * (j + 0.5), y: 10 + 640 / 6 * (i + 0.5)}
                ])
                .map(([count, center]) =>
                    count % 2 ?
                        CartesianLines.regularPolygon(center, 25, count % 4 + 8)
                        : CartesianLines.star(center, 15, 25, count % 4 + 8))
        );
    }
}

Rooms.register(Shapes3Room);
Shapes3Room.label = "Even More Polygons and Stars";
Shapes3Room.isSlow = true;

exports.Rooms = Rooms;
exports.RandomMazeRoom = RandomMazeRoom;
