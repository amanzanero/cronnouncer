export default {
  extensions: ["ts"],
  files: ["test/integration/**/*.ts", "!test/unit/*", "!test/**/mocks", "!test/test_utils"],
  require: ["ts-node/register"],
  timeout: "20s",
};
