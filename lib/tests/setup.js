const chai = require("chai");
const shallowDeepAlmostEqualPlugin = require("chai-shallow-deep-almost-equal");
const angleAlmostEqualPlugin = require("./lib/chai-angle-almost-equal");

before(() => {
  shallowDeepAlmostEqualPlugin(chai);
  angleAlmostEqualPlugin(chai);
});
