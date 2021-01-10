import test from "ava";
import moment from "moment";
import { Response } from "../../../../../src/lib";
import { createMockAnnouncement } from "../../../../test_utils/mocks/announcement";
import {
  AnnouncementIncompleteError,
  AnnouncementNotInProgressError,
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

interface TestContext {
  deps: {
    announcementRepo: MockAnnouncementRepo;
    announcementSettingsRepo: MockAnnouncementSettingsRepo;
    cronService: MockCronService;
    timeService: TimeService;
  };
}

test.before(async (t) => {
  const announcementRepo = new MockAnnouncementRepo();
  const announcementSettingsRepo = new MockAnnouncementSettingsRepo();
  const cronService = new MockCronService();
  const timeService = new TimeService();
  Object.assign(t.context, {
    deps: {
      announcementRepo,
      announcementSettingsRepo,
      cronService,
      timeService,
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

  const input: any = { guildID: undefined };
  const response = await scheduleAnnouncement(input, deps as any);

  const expectedErr = new ValidationError("guildID is null or undefined");
  t.deepEqual(response.value, expectedErr);
});

test("should fail if there is no announcement in progress", async (t) => {
  const { deps } = t.context as TestContext;

  const guildID = "guildWithSettings";
  const input: any = { guildID };
  const response = await scheduleAnnouncement(input, deps as any);

  const expectedErr = new AnnouncementNotInProgressError(guildID);
  t.deepEqual(response.value, expectedErr);
});

test("should fail if there is no timezone", async (t) => {
  const { deps } = t.context as TestContext;

  const guildID = "no timezone";
  const input: any = { guildID };
  const response = await scheduleAnnouncement(input, deps as any);

  const expectedErr = new TimezoneNotSetError();
  t.deepEqual(response.value, expectedErr);
});

test("should fail if announcement in progress is not complete", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo } = deps;

  const guildID = "1";
  await deps.announcementSettingsRepo.save(
    createMockAnnouncementSettings({
      timezone: "US/Pacific",
      guildID,
    }),
  );

  const announcement = createMockAnnouncement({ guildID });
  await announcementRepo.save(announcement);

  const input: any = { guildID };
  const response = await scheduleAnnouncement(input, deps as any);

  const expectedErr = new AnnouncementIncompleteError(
    "An announcement must have a message, scheduledTime, and channel set before publishing.",
  );
  t.deepEqual(response.value, expectedErr);
});

test("should pass if announcement in progress is completed", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo } = deps;

  const guildID = "completed";
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

  const input: any = { guildID };
  const response = await scheduleAnnouncement(input, deps as any);

  const expected = Response.success<AnnouncementOutput>(AnnouncementToOutput(announcement));
  t.deepEqual(response, expected);
});
