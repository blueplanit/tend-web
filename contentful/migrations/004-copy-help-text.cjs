// Corrects the help text on the landing copy JSON. The site keeps its cached copy
// after a rejected publish only until the next rebuild. See docs/adr/0001, Consequences.
module.exports = function (migration) {
  migration.editContentType("pageCopy").changeFieldControl("copy", "builtin", "objectEditor", {
    helpText:
      "Keep the keys and the shape. After you publish, reload the live site. No change? Read the webhook activity log, then fix or unpublish at once.",
  });
};
