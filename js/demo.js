"use strict";

class Demo {
    constructor(canvas) {
        this.canvas = canvas;
        this.lines = new CartesianLines();
        this.lines.addBox(
            new CartesianPoint(10, 10),
            new CartesianPoint(522, 522));

        paper.setup(this.canvas);
        this.lines.paint();
    }
}
