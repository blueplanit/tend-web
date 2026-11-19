// Adds help text to the two fields that had none. See issue #2, user story 7.
module.exports = function (migration) {
  migration.editContentType("pageCopy").changeFieldControl("pageKey", "builtin", "dropdown", {
    helpText: "The page this copy is for. Only the landing page reads Page copy now.",
  });

  migration.editContentType("legalDocument").changeFieldControl("title", "builtin", "singleLine", {
    helpText: "The page heading and the browser tab title.",
  });
};
