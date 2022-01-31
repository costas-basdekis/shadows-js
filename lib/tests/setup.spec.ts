import * as chai from "chai";
import shallowDeepAlmostEqualPlugin from "chai-shallow-deep-almost-equal";
import angleAlmostEqualPlugin from "./lib/chai-angle-almost-equal";

before(() => {
  shallowDeepAlmostEqualPlugin(chai);
  angleAlmostEqualPlugin(chai);
});
