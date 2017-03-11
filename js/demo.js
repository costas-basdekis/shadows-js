"use strict";

class Demo {
    constructor(canvas) {
        this.canvas = canvas;
        this.lines = new CartesianLines();
        this.lines.addBox(
            new CartesianPoint(10, 10),
            new CartesianPoint(522, 522));

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

    paint() {
        this.lines.paint();
    }
}
