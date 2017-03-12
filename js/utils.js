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

function cartesian(...arrays) {
    if (!arrays.length) {
        return [];
    }

    for (const array of arrays) {
        if (!array.length) {
            return [];
        }
    }

    let result = arrays[0].map(x => [x]);
    for (const array of arrays.slice(1)) {
        const newResult = [];
        for (const items of result) {
            newResult.push(...array.map(item => items.concat([item])));
        }
        result = newResult;
    }

    return result;
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

function sortWithCompare(array) {
    return array.sort(compare);
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

function unique(array) {
    return array
        .filter((item, index) => (index === 0) || item !== array[index - 1]);
}
