"use strict";

class Demo {
    constructor(canvas, roomsElement, xElement, yElement, calculateFpsElement,
                drawFpsElement, totalFpsElement, showWallsElement,
                showRaysElement, firstRoom=RandomMazeRoom) {
        this.canvas = canvas;
        this.roomsElement = roomsElement;
        this.xElement = xElement;
        this.yElement = yElement;
        this.calculateFpsElement = calculateFpsElement;
        this.drawFpsElement = drawFpsElement;
        this.totalFpsElement = totalFpsElement;
        this.showWallsElement = showWallsElement;
        this.showRaysElement = showRaysElement;

        this.calculateFPS = new FPS(this.calculateFpsElement);
        this.drawFPS = new FPS(this.drawFpsElement);
        this.totalFPS = new FPS(this.totalFpsElement);

        paper.setup(this.canvas);

        this.rays = new PolarLines();
        this.walls = new CartesianLines();

        this.center = {x: 50, y: 50};

        this.createRoom(firstRoom);
        this.updateRays();
        this.centerTool = this.createCenterTool(this.center);

        Rooms.populateComboBox(roomsElement);
        this.roomsElement.onchange = this.roomsOnChange.bind(this);
        this.showWallsElement.onchange = this.showWallsOnChange.bind(this);
        this.showRaysElement.onchange = this.showRaysOnChange.bind(this);
    }

    roomsOnChange(e) {
        const selected = e.target;
        const room = Rooms.roomsByName[selected.value];
        this.createRoom(room);
        this.updateRays();
    }

    showWallsOnChange(e) {
        this.updateWallsShow();
    }

    showRaysOnChange(e) {
        this.updateRaysShow();
    }

    updateWallsShow() {
        if (this.showWalls) {
            this.walls.updatePath();
        } else {
            this.walls.clearPath();
        }
    }

    updateRaysShow() {
        if (this.showRays) {
            this.rays.path.strokeColor = 'yellow';
        } else {
            this.rays.path.strokeColor = null;
        }
    }

    get showWalls() {
        return this.showWallsElement.checked;
    }

    get showRays() {
        return this.showRaysElement.checked;
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
        const center = this.demo.getPoint(toolEvent);
        this.centerPath.position = center;
        this.demo.onMouseDrag(toolEvent, center);
    }

    getPoint(toolEvent) {
        if (toolEvent.event instanceof TouchEvent) {
            return this.getTouchPoint(toolEvent);
        } else {
            return this.getMousePoint(toolEvent);
        }
    }

    getTouchPoint(toolEvent) {
        const boundingClientRect = this.canvas.getBoundingClientRect();
        const scale = 3;
        // Why 3? Nobody knows :(
        const touch = toolEvent.event.changedTouches[0];
        const center = {
            x: (touch.pageX - boundingClientRect.left) / scale,
            y: (touch.pageY - boundingClientRect.top) / scale,
        };
        return center;
    }

    getMousePoint(toolEvent) {
        return toolEvent.point;
    }

    onMouseDrag(toolEvent, center) {
        this.center = {
            x: center.x,
            y: center.y,
        };
        this.updateRays();
        this.updateCoordsDisplay();
    }

    updateRays() {
        this.totalFPS.frameStart();
        {
            this.calculateFPS.frameStart();
            {
                this.rays.fromCartesianLines(this.center, this.walls);
                this.rays.simplify();
            }
            this.calculateFPS.frameEnd();

            this.drawFPS.frameStart();
            {
                this.rays.updatePath(this.center);
                this.updateRaysShow();
                this.rays.path.fillColor = 'green';
            }
            this.drawFPS.frameEnd();
        }
        this.totalFPS.frameEnd();
    }

    createRoom(room) {
        this.walls.clear();
        this.walls.addLines(new room().create());
        this.updateWallsShow();
        this.walls.path.strokeColor = 'blue';
    }

    updateCoordsDisplay() {
        this.xElement.textContent = this.center.x;
        this.yElement.textContent = this.center.y;
    }
}
