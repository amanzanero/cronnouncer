import test from "ava";
import { createAnnouncement } from "../../../../../src/core/announcement/interactions/createAnnouncement";
import { Response } from "../../../../../src/lib";
import { TimezoneNotSetError, ValidationError } from "../../../../../src/core/announcement/errors";
import { MockAnnouncementRepo } from "../../../../test_utils/mocks/announcementRepo";
import { AnnouncementOutput } from "../../../../../src/core/announcement/interactions/common";
import { MockAnnouncementSettingsRepo } from "../../../../test_utils/mocks/announcementSettingsRepo";
import { createMockAnnouncementSettings } from "../../../../test_utils/mocks/announcementSettings";
import { AnnouncementStatus } from "../../../../../src/core/announcement/domain/announcement/Status";
import { MockLoggerService } from "../../../../test_utils/mocks/loggerService";

interface TestContext {
  deps: {
    announcementRepo: MockAnnouncementRepo;
    announcementSettingsRepo: MockAnnouncementSettingsRepo;
    loggerService: MockLoggerService;
  };
}

test.before(async (t) => {
  const announcementRepo = new MockAnnouncementRepo();
  const announcementSettingsRepo = new MockAnnouncementSettingsRepo();
  const loggerService = new MockLoggerService();
  Object.assign(t.context, {
    deps: {
      announcementRepo,
      announcementSettingsRepo,
      loggerService,
    },
  });

  const settings = createMockAnnouncementSettings({
    timezone: "US/Pacific",
    guildID: "guild-with-timezone",
  });
  await announcementSettingsRepo.save(settings);
});

test("should fail with undefined DTO field", async (t) => {
  const { deps } = t.context as TestContext;

  const response = await createAnnouncement({} as any, deps as any);

  const expectedErr = new ValidationError("guildID is null or undefined");
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
