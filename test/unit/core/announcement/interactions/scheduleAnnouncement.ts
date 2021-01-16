import test from "ava";
import moment from "moment";
import { Response } from "../../../../../src/lib";
import { createMockAnnouncement } from "../../../../test_utils/mocks/announcement";
import {
  AnnouncementIncompleteError,
  AnnouncementNotFoundError,
  TimezoneNotSetError,
  ValidationError,
} from "../../../../../src/core/announcement/errors";
import {
  AnnouncementOutput,
  AnnouncementToOutput,
} from "../../../../../src/core/announcement/interactions/common";
import { MockAnnouncementRepo } from "../../../../test_utils/mocks/announcementRepo";
import { scheduleAnnouncement } from "../../../../../src/core/announcement/interactions/scheduleAnnouncement";
import { MockCronService } from "../../../../test_utils/mocks/cronService";
import { MockAnnouncementSettingsRepo } from "../../../../test_utils/mocks/announcementSettingsRepo";
import { TimeService } from "../../../../../src/core/announcement/services/time";
import { createMockAnnouncementSettings } from "../../../../test_utils/mocks/announcementSettings";
import { MockLoggerService } from "../../../../test_utils/mocks/loggerService";
import { v4 } from "uuid";

interface TestContext {
  deps: {
    announcementRepo: MockAnnouncementRepo;
    announcementSettingsRepo: MockAnnouncementSettingsRepo;
    cronService: MockCronService;
    timeService: TimeService;
    loggerService: MockLoggerService;
  };
}

test.before(async (t) => {
  const announcementRepo = new MockAnnouncementRepo();
  const announcementSettingsRepo = new MockAnnouncementSettingsRepo();
  const cronService = new MockCronService();
  const timeService = new TimeService();
  const loggerService = new MockLoggerService();
  Object.assign(t.context, {
    deps: {
      announcementRepo,
      announcementSettingsRepo,
      cronService,
      timeService,
      loggerService,
    },
  });
  await announcementSettingsRepo.save(
    createMockAnnouncementSettings({
      timezone: "US/Pacific",
      guildID: "guildWithSettings",
    }),
  );
});

test("should fail with undefined input", async (t) => {
  const { deps } = t.context as TestContext;

  const input: any = {};
  const response = await scheduleAnnouncement(input, deps as any);

  const expectedErr = new ValidationError("No announcement id was provided.");
  t.deepEqual(response.value, expectedErr);
});

test("should fail if there is no announcement found", async (t) => {
  const { deps } = t.context as TestContext;

  const guildID = "guildWithSettings";
  const input = { announcementID: "1", guildID };
  const response = await scheduleAnnouncement(input, deps as any);

  const expectedErr = new AnnouncementNotFoundError("1");
  t.deepEqual(response.value, expectedErr);
});

test("should fail if there is no timezone", async (t) => {
  const { deps } = t.context as TestContext;

  const guildID = "no timezone";
  const announcement = createMockAnnouncement({ guildID });

  const input = { announcementID: announcement.id.value, guildID };
  const response = await scheduleAnnouncement(input, deps as any);

  const expectedErr = new TimezoneNotSetError();
  t.deepEqual(response.value, expectedErr);
});

test("should fail if announcement in progress is not complete", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo } = deps;

  const guildID = v4();
  await deps.announcementSettingsRepo.save(
    createMockAnnouncementSettings({
      timezone: "US/Pacific",
      guildID,
    }),
  );

  const announcement = createMockAnnouncement({ guildID });
  await announcementRepo.save(announcement);

  const input = { announcementID: announcement.id.value, guildID };
  const response = await scheduleAnnouncement(input, deps as any);

  const expectedErr = new AnnouncementIncompleteError(
    "An announcement must have a message, scheduledTime, and channel set before publishing.",
  );
  t.deepEqual(response.value, expectedErr);
});

test("should pass if announcement in progress is completed", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo } = deps;

  const guildID = v4();
  await deps.announcementSettingsRepo.save(
    createMockAnnouncementSettings({
      timezone: "US/Pacific",
      guildID,
    }),
  );

  const announcement = createMockAnnouncement({
    channel: "some-channel",
    guildID,
    message: "A message!",
    scheduledTime: moment().add(1, "day"),
  });
  await announcementRepo.save(announcement);

  const input = { announcementID: announcement.id.value, guildID };
  const response = await scheduleAnnouncement(input, deps as any);

  const expected = Response.success<AnnouncementOutput>(AnnouncementToOutput(announcement));
  t.deepEqual(response, expected);
});
