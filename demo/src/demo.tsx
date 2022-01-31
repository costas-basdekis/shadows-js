// @ts-ignore
import paper from "shadows-js/src/paper";
// @ts-ignore
import { Room, RandomMazeRoom, Rooms, CartesianLines, PolarLines } from "shadows-js/dist";
import { FPS } from "./FPS";
import {CartesianPoint} from "shadows-js";

export class Demo {
    private readonly canvas: HTMLCanvasElement;
    private settingsElement: HTMLElement;
    private calculateFPS: FPS;
    private drawFPS: FPS;
    private totalFPS: FPS;
    private elements: any;
    // @ts-ignore
    private rays: PolarLines;
    // @ts-ignore
    private readonly walls: CartesianLines;
    private center: CartesianPoint;
    private centerTool: paper.Tool;

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

        this.center = new CartesianPoint(50, 50);

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
        // @ts-ignore
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
        if (this.rays.path) {
            if (this.showRays) {
                this.rays.path.strokeColor = new paper.Color('yellow');
            } else {
                this.rays.path.strokeColor = null;
            }
        }
    }

    get showWalls() {
        return this.elements.showWalls.checked;
    }

    get showRays() {
        return this.elements.showRays.checked;
    }

    createCenterTool(center: CartesianPoint) {
        const tool = new paper.Tool();

        // @ts-ignore
        tool.init = Demo.initCenterTool;
        tool.onMouseDown = tool.onMouseDrag = Demo.onMouseDragCenterTool;
        // @ts-ignore
        tool.demo = this;
        // @ts-ignore
        tool.init(center);

        return tool;
    }

    static initCenterTool(this: paper.Tool, center: CartesianPoint) {
        const centerPath = new paper.Path.Circle(center.toPaper(), 15);
        centerPath.strokeColor = new paper.Color('red');
        centerPath.fillColor = new paper.Color('yellow');

        // @ts-ignore
        // noinspection JSUnusedGlobalSymbols
        this.centerPath = centerPath;
    }

    static onMouseDragCenterTool(this: paper.Tool, toolEvent: paper.ToolEvent) {
        const tool = this as any as paper.Tool;
        // @ts-ignore
        const demo = tool.demo as Demo;
        const center = demo.getPoint(toolEvent);
        // @ts-ignore
        tool.centerPath.position = center;
        demo.onMouseDrag(toolEvent, center);
    }

    getPoint(toolEvent: paper.ToolEvent): CartesianPoint {
        return new CartesianPoint(
            toolEvent.point.x,
            toolEvent.point.y,
        );
    }

    onMouseDrag(toolEvent: paper.ToolEvent, center: CartesianPoint) {
        this.center = center;
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
                if (this.rays.path) {
                    this.rays.path.fillColor = new paper.Color('green');
                }
            }
            this.drawFPS.frameEnd();
        }
        this.totalFPS.frameEnd();
    }

    createRoom(room: typeof Room) {
        this.walls.clear();
        this.walls.addLines(new room().create());
        this.updateWallsShow();
        if (this.walls.path) {
            this.walls.path.strokeColor = new paper.Color('blue');
        }
    }

    updateCoordsDisplay() {
        this.elements.x.textContent = this.center.x;
        this.elements.y.textContent = this.center.y;
    }
}
