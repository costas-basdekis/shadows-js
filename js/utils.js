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

function zip(...arrays) {
    if (!arrays.length) {
        return [];
    }

    const lengths = arrays.map(array => array.length);
    const minLength = Math.min(...lengths);
    const minLengthArrays = arrays.filter(array => array.length === minLength);
    const aMinLengthArray = minLengthArrays[0];

    return aMinLengthArray.map((_, index) => arrays.map(array => array[index]));
}

function compareTuples(lhs, rhs) {
    const pairs = zip(lhs, rhs);

    for (const [lItem, rItem] of pairs) {
        if (lItem < rItem) {
            return -1;
        } else if (lItem > rItem) {
            return 1;
        }
    }

    if (lhs.length < rhs.length) {
        return -1;
    } else if (lhs.length > rhs.length) {
        return 1;
    }

    return 0;
}
