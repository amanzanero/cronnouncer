import test from "ava";
import moment from "moment";
import { setTime } from "../../../../../src/core/announcement/interactions/setTime";
import { Response } from "../../../../../src/lib";
import { createMockAnnouncement } from "../../../../test_utils/mocks/announcement";
import {
  AnnouncementNotInProgressError,
  TimeInPastError,
  ValidationError,
} from "../../../../../src/core/announcement/errors";
import {
  AnnouncementOutput,
  AnnouncementToOutput,
} from "../../../../../src/core/announcement/interactions/common";
import { MockAnnouncementRepo } from "../../../../test_utils/mocks/announcementRepo";
import { DATE_FORMAT } from "../../../../../src/core/announcement/services/cron";
import { MockCronService } from "../../../../test_utils/mocks/cronService";
import { MockAnnouncementSettingsRepo } from "../../../../test_utils/mocks/announcementSettingsRepo";
import { createMockAnnouncementSettings } from "../../../../test_utils/mocks/announcementSettings";
import { ScheduledTime } from "../../../../../src/core/announcement/domain/announcement";
import { TimeService } from "../../../../../src/core/announcement/services/time";

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
  const timeService = new TimeService();
  const cronService = new MockCronService();
  Object.assign(t.context, {
    deps: {
      announcementRepo,
      announcementSettingsRepo,
      cronService,
      timeService,
    },
  });

  await announcementRepo.save(
    createMockAnnouncement({
      guildID: "guildWithSettingsAndAnnouncement",
    }),
  );
  await announcementSettingsRepo.save(
    createMockAnnouncementSettings({
      timezone: "US/Pacific",
      guildID: "guildWithSettingsAndAnnouncement",
    }),
  );
  await announcementSettingsRepo.save(
    createMockAnnouncementSettings({
      timezone: "US/Pacific",
      guildID: "guildWithSettings",
    }),
  );
});

test("should fail with bad input", async (t) => {
  const { deps } = t.context as TestContext;

  const invalidTime = moment().toISOString();
  const inputInvalidTime = {
    guildID: "guildWithSettingsAndAnnouncement",
    scheduledTime: invalidTime,
  };
  const responseInvalidTime = await setTime(inputInvalidTime, deps as any);
  const expectedInvalidError = new ValidationError(ScheduledTime.invalidTimeMessage(invalidTime));
  t.deepEqual(responseInvalidTime.value, expectedInvalidError);

  const futureTime = moment().format(DATE_FORMAT);
  const inputFutureTime = {
    guildID: "guildWithSettingsAndAnnouncement",
    scheduledTime: futureTime,
  };
  const responseFutureTime = await setTime(inputFutureTime, deps as any);
  const expectedFutureTimeError = new TimeInPastError();
  t.deepEqual(responseFutureTime.value, expectedFutureTimeError);
});

test("should fail if there is no announcement in progress", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementSettingsRepo } = deps;

  const guildID = "1";
  await announcementSettingsRepo.save(
    createMockAnnouncementSettings({ guildID, timezone: "US/Pacific" }),
  );
  const input = {
    guildID,
    scheduledTime: moment().add(1, "day").format(DATE_FORMAT),
  };
  const response = await setTime(input, deps as any);

  const expectedErr = new AnnouncementNotInProgressError(guildID);
  t.deepEqual(response.value, expectedErr);
});

test("should set time if announcement in progress", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo, announcementSettingsRepo } = deps;

  const guildID = "guildWithSettings";
  const mScheduledTime = moment().add(2, "minutes");

  const announcement = createMockAnnouncement({
    guildID,
    scheduledTime: mScheduledTime,
  });
  await announcementRepo.save(announcement);

  const settings = createMockAnnouncementSettings({ timezone: "US/Pacific", guildID });
  await announcementSettingsRepo.save(settings);

  const input = { guildID, scheduledTime: mScheduledTime.format(DATE_FORMAT) };
  const response = await setTime(input, deps as any);

  const expected = Response.success<AnnouncementOutput>(AnnouncementToOutput(announcement));
  t.deepEqual(response, expected);
});
