export default {
  extensions: ["ts"],
  files: ["test/unit/**/*.ts", "!test/**/mocks", "!test/test_utils"],
  require: ["ts-node/register"],
};
