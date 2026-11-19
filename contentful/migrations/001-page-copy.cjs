// Creates the pageCopy content type. One entry holds the copy for one page as JSON.
// The JSON shape lives in code: lib/landing-copy.ts checks it with zod.
// See docs/adr/0001-contentful-content.md.
module.exports = function (migration) {
  const pageCopy = migration
    .createContentType("pageCopy")
    .name("Page copy")
    .description("All copy for one page, as JSON. The website checks the shape on every publish.")
    .displayField("pageKey");

  pageCopy
    .createField("pageKey")
    .name("Page key")
    .type("Symbol")
    .required(true)
    .validations([{ unique: true }, { in: ["landing"] }]);

  pageCopy.createField("copy").name("Copy").type("Object").required(true);

  pageCopy.changeFieldControl("pageKey", "builtin", "dropdown");
  pageCopy.changeFieldControl("copy", "builtin", "objectEditor", {
    helpText:
      "Keep the same keys as the current JSON. An invalid shape is rejected, and the site keeps the last good copy.",
  });
};
