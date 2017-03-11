const expect = chai.expect;

describe("CartesianPoint", function() {
    describe("constructor", function() {
        it("Should have x and y", function() {
            const point = new CartesianPoint(10, 10);
            expect(point.x).to.equal(10);
            expect(point.y).to.equal(10);
        });
    });
});
