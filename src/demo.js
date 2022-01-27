const paper = require("paper");
const { RandomMazeRoom, Rooms } = require("./Rooms");
const { FPS } = require("./FPS");
const { PolarLines } = require("./PolarLines");
const { CartesianLines } = require("./CartesianLines");

class Demo {
    constructor(canvas, settingsElement, firstRoom=RandomMazeRoom) {
        this.canvas = canvas;
        this.settingsElement = settingsElement;
        this.createElements();
        this.getElements();

        this.calculateFPS = new FPS(this.elements.calculateFps);
        this.drawFPS = new FPS(this.elements.drawFps);
        this.totalFPS = new FPS(this.elements.totalFps);

        try {
            paper.setup(this.canvas);
        } catch (e) {
            console.error(e);
        }

        this.rays = new PolarLines();
        this.walls = new CartesianLines();

        this.center = {x: 50, y: 50};

        this.createRoom(firstRoom);
        this.updateRays();
        this.centerTool = this.createCenterTool(this.center);

        Rooms.populateComboBox(this.elements.rooms);
        this.elements.rooms.onchange = this.roomsOnChange.bind(this);
        this.elements.showWalls.onchange = this.showWallsOnChange.bind(this);
        this.elements.showRays.onchange = this.showRaysOnChange.bind(this);
    }

    createElements() {
        this.settingsElement.innerHTML = `
            <div>
                <label>
                    Room
                    <select id="rooms"></select>
                </label>
                <label>Show walls <input type="checkbox" id="show-walls" checked="checked"></label>
                <label>Show rays <input type="checkbox" id="show-rays"></label>
            </div>
            <div>
                <label>
                    X: <span id="x"></span>
                    Y: <span id="y"></span>
                </label>
                <label>
                    Calculate FPS: <span id="calculate-fps"></span>
                </label>
                <label>
                    Draw FPS: <span id="draw-fps"></span>
                </label>
                <label>
                    Total FPS: <span id="total-fps"></span>
                </label>
            </div>
        `;
    }

    getElements() {
        this.elements = {
            rooms: this.settingsElement.querySelector("#rooms"),
            x: this.settingsElement.querySelector("#x"),
            y: this.settingsElement.querySelector("#y"),
            calculateFps: this.settingsElement.querySelector("#calculate-fps"),
            drawFps: this.settingsElement.querySelector("#draw-fps"),
            totalFps: this.settingsElement.querySelector("#total-fps"),
            showWalls: this.settingsElement.querySelector("#show-walls"),
            showRays: this.settingsElement.querySelector("#show-rays"),
        };
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
        return this.elements.showWalls.checked;
    }

    get showRays() {
        return this.elements.showRays.checked;
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
                this.rays.updatePath(this.center, this.showRays);
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
        this.elements.x.textContent = this.center.x;
        this.elements.y.textContent = this.center.y;
    }
}

exports.Demo = Demo;
