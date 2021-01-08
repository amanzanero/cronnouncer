export default {
  extensions: ["ts"],
  files: ["test/unit/**/*.ts", "!test/**/mocks", "!test/test_utils", "!test/e2e"],
  // files: ["test/unit/core/announcement/interactions/publishAnnouncement.ts", "!test/**/mocks", "!test/test_utils", "!test/e2e"],
  require: ["ts-node/register"],
};
