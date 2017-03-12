"use strict";

class Demo {
    constructor(canvas, roomsElement) {
        this.canvas = canvas;
        paper.setup(this.canvas);

        this.rays = new PolarLines();
        this.walls = new CartesianLines();

        this.center = {x: 50, y: 50};

        this.createRoom(Rooms.roomsByName['createMaze']);
        this.updateRays();
        this.centerTool = this.createCenterTool(this.center);

        this.paint();

        Rooms.populateComboBox(roomsElement);
        roomsElement.onchange = this.roomsOnChange.bind(this);
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
        this.walls.addLines(room.create());
        this.walls.updatePath();
        this.walls.path.strokeColor = 'blue';
    }

    paint() {
        paper.view.draw();
    }
}
