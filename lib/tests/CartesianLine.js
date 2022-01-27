const { expect } = require('chai');
const { CartesianPoint } = require("../src/CartesianPoint");
const { CartesianLine } = require("../src/CartesianLine");

describe("CartesianLine", function () {
    describe("constructor", function () {
        it("Should have a start and end", function () {
            const line = new CartesianLine(
                new CartesianPoint(1, 1), new CartesianPoint(2, 2));

            expect(line.start).be.not.be.null;
            expect(line.end).be.not.be.null;
        });
    });
});
