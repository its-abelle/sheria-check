const path = require("node:path");
const { createRequire } = require("node:module");
const expoRequire = createRequire(require.resolve("expo/package.json"));
const { setupTypedRoutes } = expoRequire(
  "@expo/cli/build/src/start/server/type-generation/routes",
);
setupTypedRoutes({
  projectRoot: path.resolve(__dirname, ".."),
  routerDirectory: path.resolve(__dirname, "../app"),
  typesDirectory: path.resolve(__dirname, "../.expo/types"),
});
