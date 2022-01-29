// @ts-ignore
import paper from "shadows.js/src/paper";
// @ts-ignore
import { Room, RandomMazeRoom, Rooms } from "shadows.js/src/Rooms";
import { FPS } from "./FPS";
// @ts-ignore
import { PolarLines } from "shadows.js/src/PolarLines";
// @ts-ignore
import { CartesianLines } from "shadows.js/src/CartesianLines";

export class Demo {
    private readonly canvas: HTMLCanvasElement;
    private settingsElement: HTMLElement;
    private calculateFPS: FPS;
    private drawFPS: FPS;
    private totalFPS: FPS;
    private elements: any;
    private rays: PolarLines;
    private readonly walls: CartesianLines;
    private center: { x: number; y: number };
    private centerTool: paper.Tool;
    private static centerPath: paper.Path.Circle;

    constructor(canvas: HTMLCanvasElement, settingsElement: HTMLElement, firstRoom: typeof Room=RandomMazeRoom) {
        this.canvas = canvas;
        this.settingsElement = settingsElement;
        this.createElements();
        this.getElements();

        this.calculateFPS = new FPS(this.elements.calculateFps);
        this.drawFPS = new FPS(this.elements.drawFps);
        this.totalFPS = new FPS(this.elements.totalFps);

        paper.setup(this.canvas);

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

    roomsOnChange(e: Event) {
        const selected: HTMLSelectElement = e.target! as HTMLSelectElement;
        const room = Rooms.roomsByName[selected.value];
        this.createRoom(room);
        this.updateRays();
    }

    showWallsOnChange() {
        this.updateWallsShow();
    }

    showRaysOnChange() {
        this.updateRaysShow();
    }

    updateWallsShow() {
        // For tests
        if (!paper.project) {
            return;
        }
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

    createCenterTool(center: { x: number; y: number }) {
        const tool = new paper.Tool();

        tool.init = Demo.initCenterTool;
        tool.onMouseDown = tool.onMouseDrag = Demo.onMouseDragCenterTool;
        tool.demo = this;
        tool.init(center);

        return tool;
    }

    static initCenterTool(center: { x: number; y: number }) {
        this.centerPath = new paper.Path.Circle(center, 15);
        this.centerPath.strokeColor = 'red';
        this.centerPath.fillColor = 'yellow';
    }

    static onMouseDragCenterTool(toolEvent: paper.ToolEvent) {
        const tool = this as paper.Tool;
        const center = tool.demo.getPoint(toolEvent);
        this.centerPath.position = center;
        tool.demo.onMouseDrag(toolEvent, center);
    }

    getPoint(toolEvent: paper.ToolEvent) {
        if (toolEvent.event instanceof TouchEvent) {
            return this.getTouchPoint(toolEvent);
        } else {
            return this.getMousePoint(toolEvent);
        }
    }

    getTouchPoint(toolEvent: paper.ToolEvent) {
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

    getMousePoint(toolEvent: paper.ToolEvent) {
        return toolEvent.point;
    }

    onMouseDrag(toolEvent: paper.ToolEvent, center: { x: number; y: number }) {
        this.center = {
            x: center.x,
            y: center.y,
        };
        this.updateRays();
        this.updateCoordsDisplay();
    }

    updateRays() {
        this.totalFPS.frameStart();
        // eslint-disable-next-line
        {
            this.calculateFPS.frameStart();
            // eslint-disable-next-line
            {
                this.rays.fromCartesianLines(this.center, this.walls);
                this.rays.simplify();
            }
            this.calculateFPS.frameEnd();

            this.drawFPS.frameStart();
            // eslint-disable-next-line
            {
                this.rays.updatePath(this.center, this.showRays);
                this.updateRaysShow();
                this.rays.path.fillColor = 'green';
            }
            this.drawFPS.frameEnd();
        }
        this.totalFPS.frameEnd();
    }

    createRoom(room: typeof Room) {
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
