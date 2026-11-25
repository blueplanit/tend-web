import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname) },
  },
  test: {
    environment: "node",
    // Each test starts with the real environment. A test that stubs a variable cannot leak it.
    unstubEnvs: true,
  },
});
