import { describe, expect, it } from "vitest";
import { pageUrlWithoutQuery } from "./page-url";

describe("the page URL that analytics tools record", () => {
  it("drops the query, which can carry personal information", () => {
    expect(
      pageUrlWithoutQuery("https://tend.example/blog/interest?email=jo@example.com&utm_source=reddit"),
    ).toBe("https://tend.example/blog/interest");
  });

  it("drops the fragment", () => {
    expect(pageUrlWithoutQuery("https://tend.example/#token=abc")).toBe("https://tend.example/");
  });

  it("returns an empty value for a value that is not a URL", () => {
    expect(pageUrlWithoutQuery("not a url")).toBe("");
  });
});
