import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    testTimeout: 30000,
    env: {
      DATABASE_URL: process.env.DATABASE_URL || "postgres://sheria:sheria_prod@localhost:5432/sheria_check_test",
      ADMIN_PASSWORD: "test_admin",
      NODE_ENV: "test",
      PORT: "4001",
    },
  },
});
