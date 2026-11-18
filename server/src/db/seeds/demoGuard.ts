/** Keep fictional visual-test content away from ordinary application databases. */
export function assertDemoDatabase(databaseUrl: string, nodeEnv: string): void {
  const url = new URL(databaseUrl);
  if (
    nodeEnv === "production" ||
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !["localhost", "127.0.0.1", "[::1]", "db"].includes(url.hostname) ||
    !/^\/[a-zA-Z0-9_]+_demo$/.test(url.pathname)
  ) {
    throw new Error(
      "Demo data requires a local database whose name ends in _demo, outside production.",
    );
  }
}
