// Creates the legalDocument content type: the privacy policy and the terms of use.
// The body is Markdown. See docs/adr/0001-contentful-content.md.
module.exports = function (migration) {
  const legalDocument = migration
    .createContentType("legalDocument")
    .name("Legal document")
    .description("The privacy policy or the terms of use.")
    .displayField("title");

  legalDocument
    .createField("slug")
    .name("Slug")
    .type("Symbol")
    .required(true)
    .validations([{ unique: true }, { in: ["privacy", "terms"] }]);

  legalDocument
    .createField("title")
    .name("Title")
    .type("Symbol")
    .required(true);

  legalDocument
    .createField("description")
    .name("Description")
    .type("Symbol")
    .required(true);

  legalDocument
    .createField("lastUpdated")
    .name("Last updated")
    .type("Date")
    .required(true);

  legalDocument
    .createField("body")
    .name("Body")
    .type("Text")
    .required(true);

  legalDocument.changeFieldControl("slug", "builtin", "dropdown", {
    helpText: "The page URL: /privacy or /terms.",
  });
  legalDocument.changeFieldControl("description", "builtin", "singleLine", {
    helpText: "One sentence for search results and link previews.",
  });
  legalDocument.changeFieldControl("lastUpdated", "builtin", "datePicker", {
    format: "dateonly",
    helpText: "Change this date only for a real change to the policy, not for a typo fix.",
  });
  legalDocument.changeFieldControl("body", "builtin", "markdown", {
    helpText: "Use ## for section headings, - for list items, **bold** and [text](url) for links.",
  });
};
