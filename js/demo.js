"use strict";

class Demo {
    constructor(canvas) {
        this.canvas = canvas;
        this.lines = new CartesianLines();

        this.createRoom();

        paper.setup(this.canvas);

        this.centerTool = this.createCenterTool();
        this.paint();
    }

    createCenterTool() {
        const tool = new paper.Tool();

        tool.init = Demo.initCenterTool;
        tool.onMouseDown = tool.onMouseDrag = Demo.onMouseDragCenterTool;
        tool.demo = this;
        tool.init();

        return tool;
    }

    static initCenterTool() {
        this.centerPath = new paper.Path.Circle({x: 50, y: 50}, 15);
        this.centerPath.strokeColor = 'red';
        this.centerPath.fillColor = 'yellow';
    }

    static onMouseDragCenterTool(toolEvent) {
        this.centerPath.position = {
            x: toolEvent.event.layerX,
            y: toolEvent.event.layerY,
        };
        this.demo.onMouseDrag(toolEvent);
    }

    onMouseDrag(toolEvent) {
        //
    }

    createRoom() {
        this.createBoundary();
    }

    createBoundary() {
        this.lines.addBox(
            new CartesianPoint(10, 10),
            new CartesianPoint(522, 522));

        this.lines.addLine(new CartesianLine(
            new CartesianPoint(100, 100), new CartesianPoint(100, 450)));

        this.lines.addLine(new CartesianLine(
            new CartesianPoint(450, 100), new CartesianPoint(200, 100)));
        this.lines.addLine(new CartesianLine(
            new CartesianPoint(200, 100), new CartesianPoint(200, 350)));

        this.lines.addLine(new CartesianLine(
            new CartesianPoint(425, 125), new CartesianPoint(225, 325)));

        this.lines.addLine(new CartesianLine(
            new CartesianPoint(350, 250), new CartesianPoint(350, 450)));
    }

    paint() {
        this.lines.paint();
    }
}
