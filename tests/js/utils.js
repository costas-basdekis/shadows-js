"use strict";

describe("range", function () {
    it("Should create range 1..10", function () {
        const _range = range(1, 10);

        expect(_range).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it("Should create range 1..10:1", function () {
        const _range = range(1, 10, 1);

        expect(_range).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it("Should create empty range 1..10:-1", function () {
        const _range = range(1, 10, -1);

        expect(_range).to.deep.equal([]);
    });
    it("Should create range 1..5:0.5", function () {
        const _range = range(1, 5, 0.5);

        expect(_range).to.deep.equal([1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5]);
    });


    it("Should create range -10..10", function () {
        const _range = range(-10, 10);

        expect(_range).to.deep.equal([-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it("Should create empty range 10..1", function () {
        const _range = range(10, 1);

        expect(_range).to.deep.equal([]);
    });

    it("Should create range 10..1:-1", function () {
        const _range = range(10, 1, -1);

        expect(_range).to.deep.equal([10, 9, 8, 7, 6, 5, 4, 3, 2]);
    });

    it("Should create range -50..850:200", function () {
        const _range = range(-50, 650, 200);

        expect(_range).to.deep.equal([-50, 150, 350, 550]);
    });
});

describe("compare", function () {
    it("Should know that 1 == 1", function () {
        const lhs = 1, rhs = 1;
        const result = 0;
        expect(compare(lhs, rhs)).to.equal(result);
        expect(compare(rhs, lhs)).to.equal(-result);
    });

    it("Should know that -1 < 1", function () {
        const lhs = -1, rhs = 1;
        const result = -1;
        expect(compare(lhs, rhs)).to.equal(result);
        expect(compare(rhs, lhs)).to.equal(-result);
    });

    it("Should know that 'a' == 'a'", function () {
        const lhs = "a", rhs = "a";
        const result = 0;
        expect(compare(lhs, rhs)).to.equal(result);
        expect(compare(rhs, lhs)).to.equal(-result);
    });

    it("Should know that 'a' < 'b'", function () {
        const lhs = "a", rhs = "b";
        const result = -1;
        expect(compare(lhs, rhs)).to.equal(result);
        expect(compare(rhs, lhs)).to.equal(-result);
    });

    it("Should know that null == null", function () {
        const lhs = null, rhs = null;
        const result = 0;
        expect(compare(lhs, rhs)).to.equal(result);
        expect(compare(rhs, lhs)).to.equal(-result);
    });

});

describe("sortWithCompare", function () {
    it("Should know to compare [] to []", function () {
        const array = [];
        const sorted = [];
        expect(sortWithCompare(array)).to.deep.equal(sorted);
        for (const index of range(1, array.length)) {
            const shifted = array.slice(index).concat(array.slice(0, index));
            expect(sortWithCompare(shifted)).to.deep.equal(sorted);
        }
    });

    it("Should know to compare [1] to [1]", function () {
        const array = [1];
        const sorted = [1];
        expect(sortWithCompare(array)).to.deep.equal(sorted);
        for (const index of range(1, array.length)) {
            const shifted = array.slice(index).concat(array.slice(0, index));
            expect(sortWithCompare(shifted)).to.deep.equal(sorted);
        }
    });

    it("Should know to compare [1, 2, 3] to [1, 2, 3]", function () {
        const array = [1, 2, 3];
        const sorted = [1, 2, 3];
        expect(sortWithCompare(array)).to.deep.equal(sorted);
        for (const index of range(1, array.length)) {
            const shifted = array.slice(index).concat(array.slice(0, index));
            expect(sortWithCompare(shifted)).to.deep.equal(sorted);
        }
    });

    it("Should know to compare ['a'] to ['a']", function () {
        const array = ["a"];
        const sorted = ["a"];
        expect(sortWithCompare(array)).to.deep.equal(sorted);
        for (const index of range(1, array.length)) {
            const shifted = array.slice(index).concat(array.slice(0, index));
            expect(sortWithCompare(shifted)).to.deep.equal(sorted);
        }
    });

    it("Should know to compare ['a', 'b', 'c'] to ['a', 'b', 'c']", function () {
        const array = ["a", "b", "c"];
        const sorted = ["a", "b", "c"];
        expect(sortWithCompare(array)).to.deep.equal(sorted);
        for (const index of range(1, array.length)) {
            const shifted = array.slice(index).concat(array.slice(0, index));
            expect(sortWithCompare(shifted)).to.deep.equal(sorted);
        }
    });
});

describe("compareTuples", function () {
    it("Should know that [] == []", function () {
        const lhs = [], rhs = [];
        const result = 0;
        expect(compareTuples(lhs, rhs)).to.equal(result);
        expect(compareTuples(rhs, lhs)).to.equal(-result);
    });

    it("Should know that [] < [1]", function () {
        const lhs = [], rhs = [1];
        const result = -1;
        expect(compareTuples(lhs, rhs)).to.equal(result);
        expect(compareTuples(rhs, lhs)).to.equal(-result);
    });

    it("Should know that [1] == [1]", function () {
        const lhs = [1], rhs = [1];
        const result = 0;
        expect(compareTuples(lhs, rhs)).to.equal(result);
        expect(compareTuples(rhs, lhs)).to.equal(-result);
    });

    it("Should know that [1, 2] < [1, 3]", function () {
        const lhs = [1, 2], rhs = [1, 3];
        const result = -1;
        expect(compareTuples(lhs, rhs)).to.equal(result);
        expect(compareTuples(rhs, lhs)).to.equal(-result);
    });

    it("Should know that [1, 2, 3, 4, 5] == [1, 2, 3, 4, 5]", function () {
        const lhs = [1, 2, 3, 4, 5], rhs = [1, 2, 3, 4, 5];
        const result = 0;
        expect(compareTuples(lhs, rhs)).to.equal(result);
        expect(compareTuples(rhs, lhs)).to.equal(-result);
    });

    it("Should know that [1, 2, 3, 4, 5] < [1, 2, 3, 4, 6]", function () {
        const lhs = [1, 2, 3, 4, 5], rhs = [1, 2, 3, 4, 6];
        const result = -1;
        expect(compareTuples(lhs, rhs)).to.equal(result);
        expect(compareTuples(rhs, lhs)).to.equal(-result);
    });

    it("Should know that [1, 2, 3, 4, 5] < [1, 2, 3, 4, 5, 6]", function () {
        const lhs = [1, 2, 3, 4, 5], rhs = [1, 2, 3, 4, 5, 6];
        const result = -1;
        expect(compareTuples(lhs, rhs)).to.equal(result);
        expect(compareTuples(rhs, lhs)).to.equal(-result);
    });
});

describe("zip", function () {
    it("Should return empty with no arrays", function () {
        expect(zip()).to.deep.equal([]);
    });

    it("Should return empty with one empty array", function () {
        expect(zip([1, 2, 3], [], ["a", "b", "c"])).to.deep.equal([]);
    });

    it("Should return pairs with same size arrays", function () {
        expect(zip([1, 2, 3], ["a", "b", "c"])).to.deep.equal(
            [[1, "a"], [2, "b"], [3, "c"]]);
    });

    it("Should return limited pairs with first array bigger", function () {
        expect(zip([1, 2, 3, 4, 5], ["a", "b", "c"])).to.deep.equal(
            [[1, "a"], [2, "b"], [3, "c"]]);
    });

    it("Should return limited pairs with second array bigger", function () {
        expect(zip([1, 2, 3], ["a", "b", "c", "d", "e"])).to.deep.equal(
            [[1, "a"], [2, "b"], [3, "c"]]);
    });

    it("Should return triplets with same size arrays", function () {
        expect(zip([1, 2, 3], ["a", "b", "c"], ["i", "ii", "iii"])).to.deep.equal(
            [[1, "a", "i"], [2, "b", "ii"], [3, "c", "iii"]]);
    });

    it("Should return limited triplets with first array bigger", function () {
        expect(zip([1, 2, 3, 4, 5], ["a", "b", "c"], ["i", "ii", "iii"])).to.deep.equal(
            [[1, "a", "i"], [2, "b", "ii"], [3, "c", "iii"]]);
    });

    it("Should return limited triplets with second array bigger", function () {
        expect(zip([1, 2, 3], ["a", "b", "c", "d", "e"], ["i", "ii", "iii"])).to.deep.equal(
            [[1, "a", "i"], [2, "b", "ii"], [3, "c", "iii"]]);
    });

    it("Should return limited triplets with third array bigger", function () {
        expect(zip([1, 2, 3], ["a", "b", "c"], ["i", "ii", "iii", "iv", "v"])).to.deep.equal(
            [[1, "a", "i"], [2, "b", "ii"], [3, "c", "iii"]]);
    });

    it("Should return limited triplets with first array smaller", function () {
        expect(zip([1, 2, 3], ["a", "b", "c", "d", "e"], ["i", "ii", "iii", "iv", "v"])).to.deep.equal(
            [[1, "a", "i"], [2, "b", "ii"], [3, "c", "iii"]]);
    });

    it("Should return limited triplets with second array smaller", function () {
        expect(zip([1, 2, 3, 4, 5], ["a", "b", "c"], ["i", "ii", "iii", "iv", "v"])).to.deep.equal(
            [[1, "a", "i"], [2, "b", "ii"], [3, "c", "iii"]]);
    });

    it("Should return limited triplets with third array smaller", function () {
        expect(zip([1, 2, 3, 4, 5], ["a", "b", "c", "d", "e"], ["i", "ii", "iii"])).to.deep.equal(
            [[1, "a", "i"], [2, "b", "ii"], [3, "c", "iii"]]);
    });
});

describe("unzip", function () {
    it("Should return empty with no empty array", function () {
        expect(unzip([])).to.deep.equal([]);
    });

    it("Should return two arrays from units and tuple", function () {
        expect(unzip([[], [], [3, "c"]])).to.deep.equal(
            [[undefined, undefined, 3], [undefined, undefined, "c"]]);
    });

    it("Should return two arrays from tuple and units", function () {
        expect(unzip([[1, "a"], [], []])).to.deep.equal(
            [[1, undefined, undefined], ["a", undefined, undefined]]);
    });

    it("Should return pairs with same size arrays", function () {
        expect(unzip([[1, "a"], [2, "b"], [3, "c"]])).to.deep.equal(
            [[1, 2, 3], ["a", "b", "c"]]);
    });

    it("Should return two arrays from tuples", function () {
        expect(unzip([[1, "a"], [2, "b"], [3, "c"]])).to.deep.equal(
            [[1, 2, 3], ["a", "b", "c"]]);
    });

    it("Should return three arrays from triples", function () {
        expect(unzip([[1, "a", "i"], [2, "b", "ii"], [3, "c", "iii"]])).to.deep.equal(
            [[1, 2, 3], ["a", "b", "c"], ["i", "ii", "iii"]]);
    });

    it("Should return three arrays from tuples and triples", function () {
        expect(unzip([[1, "a"], [2, "b"], [3, "c", "iii"], [4, "d", "iv"]])).to.deep.equal(
            [[1, 2, 3, 4], ["a", "b", "c", "d"], [undefined, undefined, "iii", "iv"]]);
    });

    it("Should return three arrays from triples and tuples", function () {
        expect(unzip([[1, "a", "i"], [2, "b", "ii"], [3, "c"], [4, "d"]])).to.deep.equal(
            [[1, 2, 3, 4], ["a", "b", "c", "d"], ["i", "ii", undefined, undefined]]);
    });

    it("Should return three arrays from triple and tuple and triple and tuple", function () {
        expect(unzip([[1, "a", "i"], [2, "b"], [3, "c", "iii"], [4, "d"]])).to.deep.equal(
            [[1, 2, 3, 4], ["a", "b", "c", "d"], ["i", undefined, "iii", undefined]]);
    });
});

describe("cartesian", function () {
    it("Should return [] for nothing", function () {
        const toCheck = [];
        const expected = [];
        expect(cartesian(...toCheck)).to.deep.equal(expected);
    });

    it("Should return [] for []", function () {
        const toCheck = [[]];
        const expected = [];
        expect(cartesian(...toCheck)).to.deep.equal(expected);
    });

    it("Should return [] for []x[]", function () {
        const toCheck = [[], []];
        const expected = [];
        expect(cartesian(...toCheck)).to.deep.equal(expected);
    });

    it("Should return [] for []x[]x[1, 2, 3]", function () {
        const toCheck = [[], [], [1, 2, 3]];
        const expected = [];
        expect(cartesian(...toCheck)).to.deep.equal(expected);
    });

    it("Should return [[1], [2], [3]] for [1, 2, 3]", function () {
        const toCheck = [[1, 2, 3]];
        const expected = [[1], [2], [3]];
        expect(cartesian(...toCheck)).to.deep.equal(expected);
    });

    it("Should return [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']] for [1, 2]x['a', 'b']", function () {
        const toCheck = [[1, 2], ["a", "b"]];
        const expected = [[1, "a"], [1, "b"], [2, "a"], [2, "b"]];
        expect(cartesian(...toCheck)).to.deep.equal(expected);
    });

    it("Should return [[1, 'a', 'i'], [1, 'a', 'ii'], [1, 'b', 'i'], [1, 'b', 'ii'], [2, 'a', 'i'], [2, 'a', 'ii'], [2, 'b', 'i'], [2, 'b', 'ii']] for [1, 2]x['a', 'b']x['i', 'ii']", function () {
        const toCheck = [[1, 2], ["a", "b"], ["i", "ii"]];
        const expected = [[1, "a", "i"], [1, "a", "ii"], [1, "b", "i"], [1, "b", "ii"], [2, "a", "i"], [2, "a", "ii"], [2, "b", "i"], [2, "b", "ii"],];
        expect(cartesian(...toCheck)).to.deep.equal(expected);
    });
});

describe("unique", function () {
    it("Should reduce [] to []", function () {
        const toCheck = [];
        const expected = [];
        expect(unique(toCheck)).to.deep.equal(expected);
    });

    it("Should reduce [1] to [1]", function () {
        const toCheck = [1];
        const expected = [1];
        expect(unique(toCheck)).to.deep.equal(expected);
    });

    it("Should reduce [1, 2] to [1, 2]", function () {
        const toCheck = [1, 2];
        const expected = [1, 2];
        expect(unique(toCheck)).to.deep.equal(expected);
    });

    it("Should reduce [1, 1, 2, 2] to [1, 2]", function () {
        const toCheck = [1, 1, 2, 2];
        const expected = [1, 2];
        expect(unique(toCheck)).to.deep.equal(expected);
    });

    it("Should reduce [1, 2, 1, 2] to [1, 2, 1, 2]", function () {
        const toCheck = [1, 2, 1, 2];
        const expected = [1, 2, 1, 2];
        expect(unique(toCheck)).to.deep.equal(expected);
    });

    it("Should reduce [1, 1, 2, 2, 1, 1, 2, 2] to [1, 2, 1, 2]", function () {
        const toCheck = [1, 1, 2, 2, 1, 1, 2, 2];
        const expected = [1, 2, 1, 2];
        expect(unique(toCheck)).to.deep.equal(expected);
    });

    it("Should reduce [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 2, 2, 2] to [1, 2, 1, 2]", function () {
        const toCheck = [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 2, 2, 2];
        const expected = [1, 2, 1, 2];
        expect(unique(toCheck)).to.deep.equal(expected);
    });

});

describe("groupBy", function () {
    it("Should group [] to {}", function () {
        const toCheck = [];
        const expected = {};
        expect(groupBy(toCheck)).to.deep.equal(expected);
    });

    it("Should group [1] to {'1': [1]}", function () {
        const toCheck = [1];
        const expected = {"1": [1]};
        expect(groupBy(toCheck)).to.deep.equal(expected);
    });

    it("Should group [1, 1, 1] to {'1': [1, 1, 1]}", function () {
        const toCheck = [1, 1, 1];
        const expected = {"1": [1, 1, 1]};
        expect(groupBy(toCheck)).to.deep.equal(expected);
    });

    it("Should group [1, 2, 1, 2, 1] to {'1': [1, 1, 1], '2': [2, 2]}", function () {
        const toCheck = [1, 2, 1, 2, 1];
        const expected = {"1": [1, 1, 1], "2": [2, 2]};
        expect(groupBy(toCheck)).to.deep.equal(expected);
    });

    it("Should group ['a', 'b', 'ab', 'bc', 'def', 'efg'] by length to {'1': ['a', 'b'], '2': ['ab', 'bc'], '3': ['def', 'efg']}", function () {
        const toCheck = ["a", "b", "ab", "bc", "def", "efg"];
        const expected = {"1": ["a", "b"], "2": ["ab", "bc"], "3": ["def", "efg"]};
        const keyFunc = x => x.length;
        expect(groupBy(toCheck, keyFunc)).to.deep.equal(expected);
    });
});
