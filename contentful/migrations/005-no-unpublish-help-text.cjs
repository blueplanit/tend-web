// Replaces "fix or unpublish" in the help text. Unpublishing serves no entry at all,
// so the safe fixes are republish and restore. See README "After you publish".
module.exports = function (migration) {
  migration.editContentType("pageCopy").changeFieldControl("copy", "builtin", "objectEditor", {
    helpText:
      "Keep the keys and the shape. After you publish, reload the live site. No change? Read the webhook activity log. Then fix and republish, or restore the last good version. Never unpublish or delete.",
  });

  migration.editContentType("legalDocument").changeFieldControl("body", "builtin", "markdown", {
    helpText:
      "Use ## for section headings, - for list items, **bold** and [text](url) for links. Never unpublish or delete this entry: the next deploy then fails.",
  });
};
