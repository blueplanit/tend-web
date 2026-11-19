// Runs Contentful migration files against the TendApp space, in the order given.
// Usage: npm run contentful:migrate -- contentful/migrations/006-add-field.cjs
// Run each file once only. Contentful does not record which files ran.
import path from "node:path";
import contentfulMigration from "contentful-migration";

const { runMigration } = contentfulMigration;

const files = process.argv.slice(2);
const { CONTENTFUL_SPACE_ID, CONTENTFUL_MANAGEMENT_TOKEN } = process.env;

if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_MANAGEMENT_TOKEN) {
  console.error("Set CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN in .env.local.");
  process.exit(1);
}
if (files.length === 0) {
  console.error("Name one or more migration files.");
  process.exit(1);
}

try {
  for (const file of files) {
    console.log(`Running ${file}`);
    await runMigration({
      filePath: path.resolve(file),
      spaceId: CONTENTFUL_SPACE_ID,
      environmentId: "master",
      accessToken: CONTENTFUL_MANAGEMENT_TOKEN,
      yes: true,
    });
  }
} catch (error) {
  console.error(error);
  process.exit(1);
}
