import test from "ava";
import { createAnnouncement } from "../../../../../src/core/announcement/interactions/createAnnouncement";
import { Response } from "../../../../../src/lib";
import { TimezoneNotSetError, ValidationError } from "../../../../../src/core/announcement/errors";
import { MockAnnouncementRepo } from "../../../../test_utils/mocks/announcementRepo";
import { AnnouncementOutput } from "../../../../../src/core/announcement/interactions/common";
import { MockGuildSettingsRepo } from "../../../../test_utils/mocks/guildSettingsRepo";
import { createMockGuildSettings } from "../../../../test_utils/mocks/guildSettings";
import { AnnouncementStatus } from "../../../../../src/core/announcement/domain/announcement/Status";
import { MockLoggerService } from "../../../../test_utils/mocks/loggerService";

interface TestContext {
  deps: {
    announcementRepo: MockAnnouncementRepo;
    guildSettingsRepo: MockGuildSettingsRepo;
    loggerService: MockLoggerService;
  };
}

test.before(async (t) => {
  const announcementRepo = new MockAnnouncementRepo();
  const guildSettingsRepo = new MockGuildSettingsRepo();
  const loggerService = new MockLoggerService();
  Object.assign(t.context, {
    deps: {
      announcementRepo,
      guildSettingsRepo,
      loggerService,
    },
  });

  const settings = createMockGuildSettings({
    timezone: "US/Pacific",
    guildID: "guild-with-timezone",
  });
  await guildSettingsRepo.save(settings);
});

test("should fail with undefined DTO field", async (t) => {
  const { deps } = t.context as TestContext;

  const response = await createAnnouncement({} as any, deps as any);

  const expectedErr = new ValidationError("No guildID was provided");
  t.deepEqual(response.value, expectedErr);
});

test("should not start an announcement when there is no timezone set", async (t) => {
  const { deps } = t.context as TestContext;

  const response = await createAnnouncement({ guildID: "2" }, deps as any);

  const expected = Response.fail<TimezoneNotSetError>(new TimezoneNotSetError());
  t.deepEqual(response, expected);
});

test("should successfully create", async (t) => {
  const { deps } = t.context as TestContext;

  const response = await createAnnouncement({ guildID: "guild-with-timezone" }, deps as any);

  const id = (response.value as AnnouncementOutput).id;
  t.deepEqual(
    Response.success<AnnouncementOutput>({
      id,
      guildID: "guild-with-timezone",
      status: AnnouncementStatus.unscheduled,
    }),
    response,
  );
});
