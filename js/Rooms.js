"use strict";

class Rooms {
    static createBoundary() {
        return CartesianLines.box(
            new CartesianPoint(10, 10),
            new CartesianPoint(522, 522)
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
}
