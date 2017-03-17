"use strict";

class Demo {
    constructor(canvas, roomsElement, xElement, yElement) {
        this.canvas = canvas;
        this.roomsElement = roomsElement;
        this.xElement = xElement;
        this.yElement = yElement;

        paper.setup(this.canvas);

        this.rays = new PolarLines();
        this.walls = new CartesianLines();

        this.center = {x: 50, y: 50};

        this.createRoom(MazeRoom);
        this.updateRays();
        this.centerTool = this.createCenterTool(this.center);

        this.paint();

        this.onMouseDrag({event: {layerX: this.center.x, layerY: this.center.y}});

        Rooms.populateComboBox(roomsElement);
        this.roomsElement.onchange = this.roomsOnChange.bind(this);
    }

    roomsOnChange(e) {
        const selected = e.target;
        const room = Rooms.roomsByName[selected.value];
        this.createRoom(room);
        this.updateRays();
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
        this.updateCoordsDisplay();
    }

    updateRays() {
        this.rays.fromCartesianLines(this.center, this.walls);
        this.rays.simplify();

        this.rays.updatePath(this.center);
        this.rays.path.strokeColor = 'yellow';
        this.rays.path.fillColor = 'green';
    }

    createRoom(room) {
        this.walls.clear();
        this.walls.addLines(new room().create());
        this.walls.updatePath();
        this.walls.path.strokeColor = 'blue';
    }

    paint() {
        paper.view.draw();
    }

    updateCoordsDisplay() {
        this.xElement.textContent = this.center.x;
        this.yElement.textContent = this.center.y;
    }
}
