module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/src/connection.ts",
    "/dist/",
  ],
};
