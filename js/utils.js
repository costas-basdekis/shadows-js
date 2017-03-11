"use strict";

function range(min, max, step=1) {
    const size = max - min;
    const stepsCount = Math.floor(size / step);
    if (stepsCount <= 0) {
        return [];
    }

    const items = Array.from({length: stepsCount},
        (value, key) => key * step + min);

    return items;
}
