import test from "ava";
import moment from "moment";
import { v4 } from "uuid";
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
import { MockGuildSettingsRepo } from "../../../../test_utils/mocks/guildSettingsRepo";
import { TimeService } from "../../../../../src/core/announcement/services/time";
import { createMockGuildSettings } from "../../../../test_utils/mocks/guildSettings";
import { MockLoggerService } from "../../../../test_utils/mocks/loggerService";
import { AnnouncementStatus } from "../../../../../src/core/announcement/domain/announcement/Status";

interface TestContext {
  deps: {
    announcementRepo: MockAnnouncementRepo;
    guildSettingsRepo: MockGuildSettingsRepo;
    cronService: MockCronService;
    timeService: TimeService;
    loggerService: MockLoggerService;
  };
}

test.before(async (t) => {
  const announcementRepo = new MockAnnouncementRepo();
  const guildSettingsRepo = new MockGuildSettingsRepo();
  const cronService = new MockCronService();
  const timeService = new TimeService();
  const loggerService = new MockLoggerService();
  Object.assign(t.context, {
    deps: {
      announcementRepo,
      guildSettingsRepo,
      cronService,
      timeService,
      loggerService,
    },
  });
  await guildSettingsRepo.save(
    createMockGuildSettings({
      timezone: "US/Pacific",
      guildID: "guildWithSettings",
    }),
  );
});

test("should fail with undefined input", async (t) => {
  const { deps } = t.context as TestContext;

  const input: any = {};
  const response = await scheduleAnnouncement(input, deps as any);

  const expectedErr = new ValidationError("No announcementID was provided");
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
  await deps.announcementRepo.save(announcement);

  const input = { announcementID: announcement.id.value, guildID };
  const response = await scheduleAnnouncement(input, deps as any);

  const expectedErr = new TimezoneNotSetError();
  t.deepEqual(response.value, expectedErr);

  // should be the same
  const copy = announcement.copy();
  t.deepEqual(await deps.announcementRepo.findByID(announcement.id.value), copy);
});

test("should fail if announcement in progress is not complete", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo } = deps;

  const guildID = v4();
  await deps.guildSettingsRepo.save(
    createMockGuildSettings({
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

  // should be the same
  const copy = announcement.copy();
  t.deepEqual(await deps.announcementRepo.findByID(announcement.id.value), copy);
});

test("should schedule the announcement", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo } = deps;

  const guildID = v4();
  await deps.guildSettingsRepo.save(
    createMockGuildSettings({
      timezone: "US/Pacific",
      guildID,
    }),
  );

  const announcement = createMockAnnouncement({
    channelID: "some-channel",
    guildID,
    message: "A message!",
    scheduledTime: moment().add(1, "day"),
  });
  await announcementRepo.save(announcement);

  const input = { announcementID: announcement.id.value, guildID };
  const response = await scheduleAnnouncement(input, deps as any);

  const copy = announcement.copy();
  const expectedAnnouncement = AnnouncementToOutput(copy);
  Object.assign(expectedAnnouncement, { status: AnnouncementStatus.scheduled });
  const expected = Response.success<AnnouncementOutput>(expectedAnnouncement);
  t.deepEqual(response, expected);
});
