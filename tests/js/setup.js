const chai = require("./lib/chai-v3.5.0");
const shallowDeepAlmostEqualPlugin = require("./lib/chai-shallow-deep-almost-equal-v1.3.0");

before(() => {
  shallowDeepAlmostEqualPlugin(chai);
});
