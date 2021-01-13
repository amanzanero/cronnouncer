import test from "ava";
import { editAnnouncementInfo } from "../../../../../src/core/announcement/interactions/editAnnouncementInfo";
import { Response } from "../../../../../src/lib";
import { createMockAnnouncement } from "../../../../test_utils/mocks/announcement";
import {
  AnnouncementNotInProgressError,
  TextChannelDoesNotExistError,
  TimeInPastError,
  TimezoneNotSetError,
  ValidationError,
} from "../../../../../src/core/announcement/errors";
import {
  AnnouncementOutput,
  AnnouncementToOutput,
} from "../../../../../src/core/announcement/interactions/common";
import { MockDiscordService } from "../../../../test_utils/mocks/discordService";
import { MockAnnouncementRepo } from "../../../../test_utils/mocks/announcementRepo";
import { MockAnnouncementSettingsRepo } from "../../../../test_utils/mocks/announcementSettingsRepo";
import { MockCronService } from "../../../../test_utils/mocks/cronService";
import { TimeService } from "../../../../../src/core/announcement/services/time";
import { createMockAnnouncementSettings } from "../../../../test_utils/mocks/announcementSettings";
import moment from "moment";
import { DATE_FORMAT } from "../../../../../src/core/announcement/services/cron";
import { Message, ScheduledTime } from "../../../../../src/core/announcement/domain/announcement";

interface TestContext {
  deps: {
    announcementRepo: MockAnnouncementRepo;
    announcementSettingsRepo: MockAnnouncementSettingsRepo;
    cronService: MockCronService;
    discordService: MockDiscordService;
    timeService: TimeService;
  };
}

test.before(async (t) => {
  const announcementRepo = new MockAnnouncementRepo();
  const announcementSettingsRepo = new MockAnnouncementSettingsRepo();
  const discordService = new MockDiscordService();
  const timeService = new TimeService();
  const cronService = new MockCronService();
  Object.assign(t.context, {
    deps: {
      announcementRepo,
      announcementSettingsRepo,
      cronService,
      discordService,
      timeService,
    },
  });

  Object.assign(discordService.channels, {
    exists: true,
  });

  await announcementRepo.save(
    createMockAnnouncement({
      guildID: "guildWithSettingsAndAnnouncement",
    }),
  );
  await announcementRepo.save(
    createMockAnnouncement({
      guildID: "guildWithNoSettings",
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
  await announcementSettingsRepo.save(
    createMockAnnouncementSettings({
      timezone: "US/Pacific",
      guildID: "dne",
    }),
  );
});

const longMessage = `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`;

test("should return validation error with bad input", async (t) => {
  const { deps } = t.context as TestContext;

  const input: any = {
    guildID: "guildWithSettingsAndAnnouncement",
    message: longMessage + longMessage,
  };
  const response = await editAnnouncementInfo(input, deps as any);

  const expectedErr = Response.fail<ValidationError>(
    new ValidationError(Message.characterCountOutOfRangeMessage()),
  );
  t.deepEqual(response, expectedErr);
});

test("should return AnnouncementNotInProgressError", async (t) => {
  const { deps } = t.context as TestContext;

  const guildID = "1";
  const input: any = { guildID, channel: "some channel" };
  const response = await editAnnouncementInfo(input, deps as any);

  const expectedErr = Response.fail<AnnouncementNotInProgressError>(
    new AnnouncementNotInProgressError(guildID),
  );
  t.deepEqual(response, expectedErr);
});

test("should return TextChannelDoesNotExistError", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo } = deps;

  const guildID = "guildWithSettingsAndAnnouncement";
  const channel = "dne";

  const announcement = createMockAnnouncement({
    guildID,
  });
  await announcementRepo.save(announcement);

  const input = { guildID, channel };
  const response = await editAnnouncementInfo(input, deps as any);

  const expectedErr = Response.fail<TextChannelDoesNotExistError>(
    new TextChannelDoesNotExistError(channel),
  );
  t.deepEqual(response, expectedErr);
});

test("should return success response", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo } = deps;

  const guildID = "guildWithSettingsAndAnnouncement";
  const channel = "exists";

  const announcement = createMockAnnouncement({
    guildID,
  });
  await announcementRepo.save(announcement);

  const input = { guildID, channel };
  const response = await editAnnouncementInfo(input, deps as any);

  const announcementCopy = announcement.copy();
  const expectedAnnouncement = AnnouncementToOutput(announcementCopy);
  Object.assign(expectedAnnouncement, { channel });
  const expected = Response.success<AnnouncementOutput>(expectedAnnouncement);

  t.deepEqual(response, expected);
});

test("should set message if announcement in progress", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo, announcementSettingsRepo } = deps;

  const guildID = "2";
  const message = "A valid message";

  const announcement = createMockAnnouncement({
    guildID,
  });
  await announcementRepo.save(announcement);
  await announcementSettingsRepo.save(
    createMockAnnouncementSettings({ guildID, timezone: "US/Pacific" }),
  );
  const input = { guildID, message };
  const response = await editAnnouncementInfo(input, deps as any);

  const announcementCopy = announcement.copy();
  const expectedAnnouncement = AnnouncementToOutput(announcementCopy);
  Object.assign(expectedAnnouncement, { message });
  const expected = Response.success<AnnouncementOutput>(expectedAnnouncement);

  t.deepEqual(response, expected);
});

test("should not set time if there is no timezone", async (t) => {
  const { deps } = t.context as TestContext;
  const mScheduledTime = moment().add(2, "minutes");

  const guildID = "guildWithNoSettings";
  const input: any = { guildID, scheduledTime: mScheduledTime.format(DATE_FORMAT) };
  const response = await editAnnouncementInfo(input, deps as any);

  const expectedErr = Response.fail<TimezoneNotSetError>(new TimezoneNotSetError());
  t.deepEqual(response, expectedErr);
});

test("should not set improperly formatted time", async (t) => {
  const { deps } = t.context as TestContext;
  const mScheduledTime = moment().add(2, "minutes");

  const guildID = "guildWithSettingsAndAnnouncement";
  const input: any = { guildID, scheduledTime: mScheduledTime.toISOString() };
  const response = await editAnnouncementInfo(input, deps as any);

  const expectedErr = Response.fail<ValidationError>(
    new ValidationError(ScheduledTime.invalidTimeMessage(mScheduledTime.toISOString())),
  );
  t.deepEqual(response, expectedErr);
});

test("should not set past time", async (t) => {
  const { deps } = t.context as TestContext;
  const mScheduledTime = moment();

  const guildID = "guildWithSettingsAndAnnouncement";
  const input: any = { guildID, scheduledTime: mScheduledTime.format(DATE_FORMAT) };
  const response = await editAnnouncementInfo(input, deps as any);

  const expectedErr = Response.fail<TimeInPastError>(new TimeInPastError());
  t.deepEqual(response, expectedErr);
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
  const response = await editAnnouncementInfo(input, deps as any);

  const expected = Response.success<AnnouncementOutput>(AnnouncementToOutput(announcement));
  t.deepEqual(response, expected);
});
