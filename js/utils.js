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

function unzip(zipped) {
    if (!zipped.length) {
        return [];
    }

    const arrays = [];
    for (const index of range(0, zipped.length)) {
        const item = zipped[index];
        // Push arrays with `undefined`s if the item is longer than previous
        // ones
        let paddedItem = item;
        if (item.length > arrays.length) {
            // Fill with arrays with `undefined`s
            arrays.push(...Array.from({
                length: item.length - arrays.length,
            }, _ => Array.from({length: index})));
        } else if (item.length < arrays.length) {
            // Pad item with `undefined`s
            paddedItem = paddedItem.concat(Array.from({
                length: arrays.length - paddedItem.length,
            }));
        }
        for (const [value, array] of zip(paddedItem, arrays)) {
            array.push(value);
        }
    }

    return arrays;
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

function compareWithKey(keyFunc) {
    function keyCompare(lhs, rhs) {
        const lKey = keyFunc(lhs);
        const rKey = keyFunc(rhs);
        return compare(lKey, rKey);
    }

    return keyCompare;
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

function sortCompareFunc(lhs, rhs) {
    return lhs.sortCompare(rhs);
}

function sortWithCompareFunc(array) {
    return array.sort(sortCompareFunc);
}

function unique(array) {
    return array
        .filter((item, index) => (index === 0) || item !== array[index - 1]);
}

function groupBy(array, keyFunc=x => x) {
    const byKey = {};

    for (const item of array) {
        const key = keyFunc(item);
        if (!(key in byKey)) {
            byKey[key] = [];
        }
        byKey[key].push(item);
    }

    return byKey;
}
