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
