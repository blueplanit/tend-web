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

  it("drops every other parameter, utm_term included, and the fragment", () => {
    expect(
      pageLocationForGa(
        "https://tend.example/blog?email=jo%40example.com&utm_term=jo+smith&utm_source=reddit&utm_medium=social#x",
      ),
    ).toBe("https://tend.example/blog?utm_source=reddit&utm_medium=social");
  });

  it("records a tag value outside the reviewed list as unlisted, as the attribution fields do", () => {
    expect(
      pageLocationForGa(
        "https://tend.example/?utm_source=jo-smith&utm_medium=paid-social&utm_campaign=jo-smith&utm_content=jo%40example.com",
      ),
    ).toBe(
      "https://tend.example/?utm_source=unlisted&utm_medium=paid-social&utm_campaign=unlisted&utm_content=unlisted",
    );
  });

  it("keeps only the main domain of a tagged referral, because a subdomain can name a person", () => {
    expect(pageLocationForGa("https://tend.example/?utm_source=jo-smith.substack.com&utm_medium=referral")).toBe(
      "https://tend.example/?utm_source=substack.com&utm_medium=referral",
    );
  });

  it("gives an ad click the same source as the attribution fields, and drops the click ID", () => {
    expect(
      pageLocationForGa("https://tend.example/?utm_source=tiktok&utm_medium=social&utm_content=tiktok-regrows&gclid=abc"),
    ).toBe("https://tend.example/?utm_source=google&utm_medium=cpc&utm_content=tiktok-regrows");
  });

  it("returns an empty value for a value that is not a URL", () => {
    expect(pageLocationForGa("not a url")).toBe("");
  });
});
