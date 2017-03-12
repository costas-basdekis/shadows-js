"use strict";

function range(min, max, step=1) {
    const size = max - min;
    const stepsCount = Math.ceil(size / step);
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

function compare(lhs, rhs) {
    if (lhs < rhs) {
        return -1;
    } else if (lhs > rhs) {
        return 1;
    } else {
        return 0;
    }
}

function compareTuples(lhs, rhs) {
    const compared = zip(lhs, rhs)
        .map(([lItem, rItem]) => compare(lItem, rItem))
        .filter(c => c !== 0);
    if (compared.length) {
        return compared[0];
    } else {
        return compare(lhs.length, rhs.length);
    }
}
