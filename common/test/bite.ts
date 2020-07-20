import "mocha";
import { expect } from "chai";
import { allBites, searchBites, replaceBiteSSML } from "../src/models/Bite";

describe("Search bites", () => {
  it("Filters search terms correctly", () => {
    const results = searchBites("metal");
    expect(results.length).to.be.equal(1);
    expect(results[0].name).to.be.equal("metalGearAlert");
  });
  it("Filters search terms correctly, case sensitivity", () => {
    const results = searchBites("METAL");
    expect(results.length).to.be.equal(1);
    expect(results[0].name).to.be.equal("metalGearAlert");
  });
  it("Search term with no matches returns no results", () => {
    const results = searchBites("invalidsearch");
    expect(results.length).to.be.equal(0);
  });
  it("Empty search term returns all bites", () => {
    const results = searchBites("");
    expect(results.length).to.be.equal(allBites.length);
  });
});

describe("Replace bite text with SSML", () => {
  it("Replaces bite text with SSML at end of text", () => {
    const ssml = replaceBiteSSML("This is an alert metalGearAlert");
    expect(ssml.indexOf("<audio")).to.be.not.equal(-1);
  });
  it("Doesn't replace non bite text with SSML", () => {
    const ssml = replaceBiteSSML("This is not an alert");
    expect(ssml.indexOf("<audio")).to.be.equal(-1);
  });
  it("Doesn't replace bite text that isn't split with spaces", () => {
    const ssml = replaceBiteSSML("This is an alert metalGearAlert.");
    expect(ssml.indexOf("<audio")).to.be.equal(-1);
  });
});
