module.exports = {
  extends: "@istanbuljs/nyc-config-typescript",
  include: "src",
  exclude: ["src/index.ts", "src/constants.ts"],
  reporter: ["html", "text", "text-summary"],
  "check-coverage": true,
  branches: 100,
  lines: 100,
  functions: 100,
  statements: 100,
  all: true,
};
