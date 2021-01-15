import test from "ava";
import { MockAnnouncementSettingsRepo } from "../../../../test_utils/mocks/announcementSettingsRepo";
import { setAnnouncementTimezone } from "../../../../../src/core/announcement/interactions/setAnnouncementTimezone";
import { ValidationError } from "../../../../../src/core/announcement/errors";
import { Timezone } from "../../../../../src/core/announcement/domain/announcementSettings";
import { Response } from "../../../../../src/lib";
import { AnnouncementSettingsOutput } from "../../../../../src/core/announcement/interactions/common";
import { createMockAnnouncementSettings } from "../../../../test_utils/mocks/announcementSettings";
import { GuildID } from "../../../../../src/core/announcement/domain/announcement";
import { MockLoggerService } from "../../../../test_utils/mocks/loggerService";

interface TestContext {
  deps: {
    announcementSettingsRepo: MockAnnouncementSettingsRepo;
    loggerService: MockLoggerService;
  };
}

test.before((t) => {
  const announcementSettingsRepo = new MockAnnouncementSettingsRepo();
  const loggerService = new MockLoggerService();
  Object.assign(t.context, {
    deps: {
      announcementSettingsRepo,
      loggerService,
    },
  });
});

test("should return a failure for invalid input", async (t) => {
  const { deps } = t.context as TestContext;

  const timezone = "invalid timezone";
  const response = await setAnnouncementTimezone(
    {
      guildID: "1",
      timezone,
    },
    deps as any,
  );
  const expectedResponse = Response.fail<ValidationError>(
    new ValidationError(Timezone.invalidTimezoneMessage(timezone)),
  );
  t.deepEqual(response, expectedResponse);

  const nullTimezone = undefined;
  const nullTimezoneResponse = await setAnnouncementTimezone(
    {
      guildID: "1",
      timezone: nullTimezone,
    } as any,
    deps as any,
  );
  const expectedNullTimezoneResponse = Response.fail<ValidationError>(
    new ValidationError("timezone is null or undefined"),
  );
  t.deepEqual(nullTimezoneResponse, expectedNullTimezoneResponse);
});

test("should create new instance of announcement settings when not created", async (t) => {
  const { deps } = t.context as TestContext;

  const timezone = "US/Pacific";
  const response = await setAnnouncementTimezone(
    {
      guildID: "2",
      timezone,
    },
    deps as any,
  );

  const expectedResponse = Response.success<AnnouncementSettingsOutput>({ guildID: "2", timezone });
  t.deepEqual(response, expectedResponse);

  const guildID = GuildID.create("2").getValue();
  t.true(!!(await deps.announcementSettingsRepo.findByGuildID(guildID)));
});

test("should update existing instance of announcement settings with timezone", async (t) => {
  const { deps } = t.context as TestContext;

  const guildID = "2";
  const timezone = "US/Pacific";
  const existingAnnouncementSettings = createMockAnnouncementSettings({
    guildID,
  });
  await deps.announcementSettingsRepo.save(existingAnnouncementSettings);

  const response = await setAnnouncementTimezone(
    {
      guildID,
      timezone,
    },
    deps as any,
  );

  const expectedResponse = Response.success<AnnouncementSettingsOutput>({ guildID: "2", timezone });

  const updatedAnnouncementSettings = await deps.announcementSettingsRepo.findByGuildID(
    existingAnnouncementSettings.guildID,
  );

  t.deepEqual(response, expectedResponse); // get expected response
  t.is(
    updatedAnnouncementSettings && updatedAnnouncementSettings.id,
    existingAnnouncementSettings.id,
  ); // make sure it's the same instance
});
