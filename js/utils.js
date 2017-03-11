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

function hashCode(str) {
    if (!str.length) {
        return 0;
    }

    let hash = 0;
    for (const chr of str) {
        hash  = ((hash << 5) - hash) + chr.charCodeAt(0);
        hash |= 0; // Convert to 32bit integer
    }

    return hash;
}
