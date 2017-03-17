"use strict";

class Demo {
    constructor(canvas, roomsElement, xElement, yElement, fpsElement) {
        this.canvas = canvas;
        this.roomsElement = roomsElement;
        this.xElement = xElement;
        this.yElement = yElement;
        this.fpsElement = fpsElement;

        paper.setup(this.canvas);

        this.rays = new PolarLines();
        this.walls = new CartesianLines();

        this.center = {x: 50, y: 50};

        this.frameTimestamps = [];

        this.createRoom(MazeRoom);
        this.updateRays();
        this.centerTool = this.createCenterTool(this.center);

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
            x: toolEvent.point.x,
            y: toolEvent.point.y,
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
        const start = new Date().getTime();
        this.calculateFPS();
        this.rays.fromCartesianLines(this.center, this.walls);
        this.rays.simplify();

        this.rays.updatePath(this.center);
        this.rays.path.strokeColor = 'yellow';
        this.rays.path.fillColor = 'green';
        const end = new Date().getTime();
        this.calculateFPS(end - start);
    }

    createRoom(room) {
        this.walls.clear();
        this.walls.addLines(new room().create());
        this.walls.updatePath();
        this.walls.path.strokeColor = 'blue';
    }

    updateCoordsDisplay() {
        this.xElement.textContent = this.center.x;
        this.yElement.textContent = this.center.y;
    }

    calculateFPS(newTime) {
        if (!newTime) {
            return;
        }

        this.frameTimestamps.push(newTime);
        while (this.frameTimestamps.length > 150) {
            this.frameTimestamps.shift();
        }

        const totalMilliseconds = this.frameTimestamps.reduce(
            (total, current) => total + current, 0);
        const newFramerate =
            this.frameTimestamps.length / (totalMilliseconds / 1000);
        if (this.frameRate) {
            this.frameRate = (this.frameRate * 9 + newFramerate) / 10;
        } else {
            this.frameRate = newFramerate;
        }
        this.frameRate = Math.round(this.frameRate);
        this.fpsElement.textContent = this.frameRate;
    }
}
