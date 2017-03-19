"use strict";

class FPS {
    constructor(element, maxCount=150, oldFrameRateWeight=0.9) {
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

    frame(timestamp) {
        if (!timestamp) {
            return;
        }

        this.add(timestamp);
        this.calculate();
        this.display();
    }

    add(timestamp) {
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
        this.element.textContent = this.framerate;
    }
}
