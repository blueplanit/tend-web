import { vi } from "vitest";

// lib/site.ts reads the environment once, on import. So do the modules that import it.
// This helper sets the variables, then loads fresh copies of the modules.
// Call vi.unstubAllEnvs() after each test.
export async function importWithEnv<T>(env: Record<string, string>, load: () => Promise<T>): Promise<T> {
  vi.resetModules();
  for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value);
  return load();
}

// The variables that decide the deployment and the site URL.
export function deploymentEnv(vercelEnv: string): Record<string, string> {
  return { VERCEL_ENV: vercelEnv, NEXT_PUBLIC_VERCEL_ENV: "", NEXT_PUBLIC_SITE_URL: "" };
}
