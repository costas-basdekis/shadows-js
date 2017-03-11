"use strict";

class Demo {
    constructor(canvas) {
        this.canvas = canvas;
        paper.setup(this.canvas);

        this.rays = new PolarLines();
        this.walls = new CartesianLines();

        this.center = {x: 50, y: 50};

        this.createRoom();
        this.updateRays();
        this.centerTool = this.createCenterTool(this.center);

        this.paint();
    }

    createCenterTool(center) {
        const tool = new paper.Tool();

        tool.init = Demo.initCenterTool;
        tool.onMouseDown = tool.onMouseDrag = Demo.onMouseDragCenterTool;
        tool.demo = this;
        tool.init(center);

        return tool;
    }

    static initCenterTool(center) {
        this.centerPath = new paper.Path.Circle(center, 15);
        this.centerPath.strokeColor = 'red';
        this.centerPath.fillColor = 'yellow';
    }

    static onMouseDragCenterTool(toolEvent) {
        const center = {
            x: toolEvent.event.layerX,
            y: toolEvent.event.layerY,
        };
        this.centerPath.position = center;
        this.demo.onMouseDrag(toolEvent);
    }

    onMouseDrag(toolEvent) {
        this.center = {
            x: toolEvent.event.layerX,
            y: toolEvent.event.layerY,
        };
        this.updateRays();
    }

    updateRays() {
        this.rays.fromCartesianLines(this.center, this.walls);
        this.rays.updatePath(this.center);
        this.rays.path.strokeColor = 'yellow';
        this.rays.path.fillColor = 'red';
    }

    createRoom() {
        this.walls.clear();
        this.createBoundary();
        this.walls.updatePath();
        this.walls.path.strokeColor = 'blue';
    }

    createBoundary() {
        this.walls.addBox(
            new CartesianPoint(10, 10),
            new CartesianPoint(522, 522));

        this.walls.addLine(new CartesianLine(
            new CartesianPoint(100, 100), new CartesianPoint(100, 450)));

        this.walls.addLine(new CartesianLine(
            new CartesianPoint(450, 100), new CartesianPoint(200, 100)));
        this.walls.addLine(new CartesianLine(
            new CartesianPoint(200, 100), new CartesianPoint(200, 350)));

        this.walls.addLine(new CartesianLine(
            new CartesianPoint(425, 125), new CartesianPoint(225, 325)));

        this.walls.addLine(new CartesianLine(
            new CartesianPoint(350, 250), new CartesianPoint(350, 450)));
    }

    paint() {
        paper.view.draw();
    }
}
