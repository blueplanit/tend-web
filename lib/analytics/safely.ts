// Analytics must never break the page it measures. Runs fn and returns its result.
// On an error, it logs the error and returns undefined instead of throwing.
export function safely<T>(operation: string, fn: () => T): T | undefined {
  try {
    return fn();
  } catch (error) {
    console.error(`${operation} failed`, error);
    return undefined;
  }
}
