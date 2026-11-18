const path = require("node:path");
const fs = require("node:fs");
const { createRequire } = require("node:module");
const expoRequire = createRequire(require.resolve("expo/package.json"));
const { setupTypedRoutes } = expoRequire(
  "@expo/cli/build/src/start/server/type-generation/routes",
);
const typesDirectory = path.resolve(__dirname, "../.expo/types");
fs.mkdirSync(typesDirectory, { recursive: true });
setupTypedRoutes({
  projectRoot: path.resolve(__dirname, ".."),
  routerDirectory: path.resolve(__dirname, "../app"),
  typesDirectory,
});
