export function range(minOrMax: number, max: number | undefined=undefined, step: number=1): number[] {
    let min: number;
    if (typeof max === "undefined") {
        min = 0;
        max = minOrMax;
    } else {
        min = minOrMax;
    }
    const size: number = max - min;
    const stepsCount: number = Math.ceil(size / step);
    if (stepsCount <= 0) {
        return [];
    }

    const items = Array.from({length: stepsCount},
        (value, key) => key * step + min);

    return items;
}

export function hashCode(str: string): number {
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

type ZipArray = unknown[];
type ZipArrays = ZipArray[];
type ZipResult<T extends ZipArrays> = { [K in keyof T]: T[K] extends (infer V)[] ? V : never }[];

export function zip<T extends ZipArrays>(
    ...arrays: T
): ZipResult<T> {
    if (!arrays.length) {
        return [];
    }

    const lengths: number[] = arrays.map(array => array.length);
    const minLength: number = Math.min(...lengths);
    const minLengthArrays: T = arrays.filter(array => array.length === minLength) as T;
    const aMinLengthArray: ZipArray = minLengthArrays[0];

    return aMinLengthArray.map((_, index) => arrays.map(array => array[index])) as ZipResult<T>;
}

export function unzip<T extends ZipArrays>(zipped: ZipResult<T>): ZipArrays {
    if (!zipped.length) {
        return [];
    }

    const arrays: ZipArrays = [];
    for (const index of range(0, zipped.length)) {
        const item: ZipArray = zipped[index];
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

export function cartesian<T extends ZipArrays>(...arrays: T): ZipResult<T> {
    if (!arrays.length) {
        return [];
    }

    for (const array of arrays) {
        if (!array.length) {
            return [];
        }
    }

    let result: unknown[][] = arrays[0].map(x => [x]) as ZipResult<T>;
    for (const array of arrays.slice(1)) {
        const newResult: unknown[][] = [];
        for (const items of result) {
            newResult.push(...array.map(item => items.concat([item])));
        }
        result = newResult;
    }

    return result as ZipResult<T>;
}

export function compare(lhs: any, rhs: any, compareFunc: (l: any, r: any) => boolean=equals): number {
    if (compareFunc(lhs, rhs)) {
        return 0
    } else if (lhs < rhs) {
        return -1;
    } else {
        return 1;
    }
}

export function compareWithKey(keyFunc: (v: any) => number): (lhs: any, rhs: any) => number {
    function keyCompare(lhs: any, rhs: any): number {
        const lKey: number = keyFunc(lhs);
        const rKey: number = keyFunc(rhs);
        return compare(lKey, rKey);
    }

    return keyCompare;
}

export function sortWithCompare(array: any[]): any[] {
    return array.sort(compare);
}

export function compareTuples(lhs: any[], rhs: any[], compareFunc: (l: any, r: any) => boolean=equals): number {
    const compared = zip(lhs, rhs)
        .map(([lItem, rItem]) => compare(lItem, rItem, compareFunc))
        .filter(c => c !== 0);
    if (compared.length) {
        return compared[0];
    } else {
        return compare(lhs.length, rhs.length);
    }
}

export function sortCompareFunc<T extends { sortCompare: (T: any) => number }>(lhs: T, rhs: T): number {
    return lhs.sortCompare(rhs);
}

export function sortWithCompareFunc<T extends { sortCompare: (T: any) => number }>(array: T[]): T[] {
    return array.sort(sortCompareFunc);
}

export function unique<T>(array: T[]): T[] {
    return array
        .filter((item, index) => (index === 0) || item !== array[index - 1]);
}

type Groups<T> = {
    [key: string]: T[],
};

export function groupBy<T>(array: T[], keyFunc: (t: T) => string | { toString: () => string }=x => x): Groups<T> {
    const byKey: Groups<T> = {};

    for (const item of array) {
        const key: string = keyFunc(item) as string;
        if (!(key in byKey)) {
            byKey[key] = [];
        }
        byKey[key].push(item);
    }

    return byKey;
}

export function randomPick<T>(list: T[]): T | undefined {
    if (!list.length) {
        return undefined;
    }

    const index = Math.floor(Math.random() * (list.length - 1));
    return list[index];
}

export function randomPop<T>(list: T[]): T | undefined {
    if (!list.length) {
        return undefined;
    }

    const index = Math.floor(Math.random() * (list.length - 1));
    return list.splice(index, 1)[0];
}

export function equals(lhs: any, rhs: any): boolean {
    return lhs === rhs;
}

export function almostEquals(lhs: number, rhs: number, precision: number=0.000001): boolean {
    const diff = Math.abs(rhs - lhs);
    return diff <= precision;
}

export function angleAlmostEquals(lhs: number, rhs: number, precision: number=0.000001): boolean {
    let diff = Math.abs(rhs - lhs);
    while (diff >= Math.PI - precision) {
        diff -= Math.PI;
    }
    return diff <= precision;
}
angleAlmostEquals.defaultPrecision = 0.000001;
