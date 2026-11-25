import { describe, expect, it } from "vitest";
import { pageLocationForGa, urlWithoutQueryOrFragment } from "./page-url";

describe("the page URL that Amplitude records", () => {
  it("drops the query, which can carry personal information", () => {
    expect(
      urlWithoutQueryOrFragment("https://tend.example/blog/interest?email=jo@example.com&utm_source=reddit"),
    ).toBe("https://tend.example/blog/interest");
  });

  it("drops the fragment", () => {
    expect(urlWithoutQueryOrFragment("https://tend.example/#token=abc")).toBe("https://tend.example/");
  });

  it("returns an empty value for a value that is not a URL", () => {
    expect(urlWithoutQueryOrFragment("not a url")).toBe("");
  });
});

describe("the page location that GA4 records", () => {
  it("keeps the reviewed URL tags, so GA4's own reports still see the campaign", () => {
    expect(
      pageLocationForGa(
        "https://tend.example/?utm_source=reddit&utm_medium=paid-social&utm_campaign=pa002&utm_content=pa002-comic",
      ),
    ).toBe(
      "https://tend.example/?utm_source=reddit&utm_medium=paid-social&utm_campaign=pa002&utm_content=pa002-comic",
    );
  });

  it("drops every other parameter, utm_term and click IDs included, and the fragment", () => {
    expect(
      pageLocationForGa(
        "https://tend.example/blog?email=jo%40example.com&utm_term=jo+smith&gclid=abc&utm_source=reddit#x",
      ),
    ).toBe("https://tend.example/blog?utm_source=reddit");
  });

  it("drops a tag whose value could hold personal information", () => {
    expect(pageLocationForGa("https://tend.example/?utm_content=jo%40example.com&utm_source=Reddit%20Jo")).toBe(
      "https://tend.example/",
    );
  });

  it("returns an empty value for a value that is not a URL", () => {
    expect(pageLocationForGa("not a url")).toBe("");
  });
});
