"use strict";

describe("utils", function () {
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
});
