export class FPS {
    private timestamps: number[];
    private element: HTMLElement;
    private readonly maxCount: number;
    private readonly oldFrameRateWeight: number;
    private readonly newFrameRateWeight: number;
    private framerate: number | null;
    private frameStartTimestamp: number | null;

    constructor(element: HTMLElement, maxCount: number=150, oldFrameRateWeight: number=0.9) {
        this.timestamps = [];
        this.element = element;
        this.maxCount = maxCount;
        this.oldFrameRateWeight = oldFrameRateWeight;
        this.newFrameRateWeight = 1 - this.oldFrameRateWeight;
        this.framerate = null;

        this.frameStartTimestamp = null;
    }

    frameStart() {
        if (this.frameStartTimestamp) {
            console.warn("Called `frameStart` without having called `frameEnd`");
            return;
        }

        this.frameStartTimestamp = new Date().getTime();
    }

    frameEnd() {
        if (!this.frameStartTimestamp) {
            console.warn("Called `frameEnd` without having called `frameStart`");
            return;
        }

        const end = new Date().getTime();
        this.frame(end - this.frameStartTimestamp);
        this.frameStartTimestamp = null;
    }

    frame(timestamp: number | null) {
        if (!timestamp) {
            return;
        }

        this.add(timestamp);
        this.calculate();
        this.display();
    }

    add(timestamp: number) {
        this.timestamps.push(timestamp);
        while (this.timestamps.length > this.maxCount) {
            this.timestamps.shift();
        }
    }

    calculate() {
        const totalMilliseconds = this.timestamps.reduce(
            (total, current) => total + current, 0);
        const newFramerate = this.timestamps.length / totalMilliseconds * 1000;
        let framerate;
        if (this.framerate) {
            framerate =
                this.framerate * this.oldFrameRateWeight
                + newFramerate  * this.newFrameRateWeight;
        } else {
            framerate = newFramerate;
        }
        framerate = Math.round(framerate);

        this.framerate = framerate;
    }

    display() {
        this.element.textContent = `${this.framerate}`;
    }
}
