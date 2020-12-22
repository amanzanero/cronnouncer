export default {
  extensions: ["ts"],
  files: ["test/e2e/**/*.ts", "!test/test_utils", "!test/unit"],
  require: ["ts-node/register"],
};
