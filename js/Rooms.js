"use strict";

class Rooms {
    static populateComboBox(element) {
        for (const room of this.rooms) {
            const optionHTML = `<option value="${room.name}">${room.label}</option>`;
            const optionElement = document.createElement('option');
            element.appendChild(optionElement);
            optionElement.outerHTML = optionHTML;
        }
    }

    static createBoundary() {
        return CartesianLines.box(
            new CartesianPoint(10, 10),
            new CartesianPoint(650, 650)
        );
    }

    static createMaze() {
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

    static createMaze2() {
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

    static createShapes() {
        return [].concat(
            this.createBoundary(),
            CartesianLines.regularPolygon({x: 400, y: 400}, 50, 3),
            CartesianLines.regularPolygon({x: 200, y: 300}, 50, 6),
            CartesianLines.regularPolygon({x: 400, y: 200}, 50, 5),
            CartesianLines.star({x: 200, y: 500}, 35, 65, 7)
        );
    }

    static createShapes2() {
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

    static createShapes3() {
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

Rooms.rooms = [
    {
        create: Rooms.createMaze.bind(Rooms),
        name: "createMaze",
        label: "Maze",
    },
    {
        create: Rooms.createMaze2.bind(Rooms),
        name: "createMaze2",
        label: "Maze 2",
    },
    {
        create: Rooms.createShapes.bind(Rooms),
        name: "createShapes",
        label: "Polygons and Stars",
    },
    {
        create: Rooms.createShapes2.bind(Rooms),
        name: "createShapes2",
        label: "More Polygons and Stars",
    },
    {
        create: Rooms.createShapes3.bind(Rooms),
        name: "createShapes3",
        label: "Even More Polygons and Stars",
    },
];

Rooms.roomsByName = {};
for (const room of Rooms.rooms) {
    Rooms.roomsByName[room.name] = room;
}
