import test from "ava";
import { editAnnouncementInfo } from "../../../../../src/core/announcement/interactions/editAnnouncementInfo";
import { Response } from "../../../../../src/lib";
import { createMockAnnouncement } from "../../../../test_utils/mocks/announcement";
import {
  AnnouncementNotFoundError,
  InvalidTimeError,
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
import { MockGuildSettingsRepo } from "../../../../test_utils/mocks/guildSettingsRepo";
import { MockCronService } from "../../../../test_utils/mocks/cronService";
import { TimeService } from "../../../../../src/core/announcement/services/time";
import { createMockGuildSettings } from "../../../../test_utils/mocks/guildSettings";
import moment from "moment";
import { DATE_FORMAT } from "../../../../../src/core/announcement/services/cron";
import { Message } from "../../../../../src/core/announcement/domain/announcement";
import { MockLoggerService } from "../../../../test_utils/mocks/loggerService";

interface TestContext {
  deps: {
    announcementRepo: MockAnnouncementRepo;
    guildSettingsRepo: MockGuildSettingsRepo;
    cronService: MockCronService;
    discordService: MockDiscordService;
    timeService: TimeService;
    loggerService: MockLoggerService;
  };
}

test.before(async (t) => {
  const announcementRepo = new MockAnnouncementRepo();
  const guildSettingsRepo = new MockGuildSettingsRepo();
  const discordService = new MockDiscordService();
  const timeService = new TimeService();
  const cronService = new MockCronService();
  const loggerService = new MockLoggerService();

  Object.assign(t.context, {
    deps: {
      announcementRepo,
      guildSettingsRepo,
      cronService,
      discordService,
      timeService,
      loggerService,
    },
  });

  Object.assign(discordService.channels, {
    exists: true,
  });

  await guildSettingsRepo.save(
    createMockGuildSettings({
      timezone: "US/Pacific",
      guildID: "guildWithSettings",
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
  const { announcementRepo } = deps;

  const announcement = createMockAnnouncement({
    guildID: "guildWithSettings",
  });
  await announcementRepo.save(announcement);

  const input = {
    announcementID: announcement.id.value,
    guildID: "guildWithSettings",
    message: longMessage + longMessage,
  };
  const response = await editAnnouncementInfo(input, deps as any);
  const expectedErr = Response.fail<ValidationError>(
    new ValidationError(Message.characterCountOutOfRangeMessage()),
  );
  t.deepEqual(response, expectedErr);

  const inputNoID = {
    guildID: "guildWithSettings",
    message: longMessage + longMessage,
  };
  const responseNoID = await editAnnouncementInfo(inputNoID as any, deps as any);
  const expectedErrNoID = Response.fail<ValidationError>(
    new ValidationError("No announcementID was provided"),
  );
  t.deepEqual(responseNoID, expectedErrNoID);
});

test("should return AnnouncementNotFoundError", async (t) => {
  const { deps } = t.context as TestContext;

  const announcementID = "1";
  const input = { announcementID, guildID: "guildWithSettings", channelID: "some channel" };
  const response = await editAnnouncementInfo(input, deps as any);

  const expectedErr = Response.fail<AnnouncementNotFoundError>(
    new AnnouncementNotFoundError(announcementID),
  );
  t.deepEqual(response, expectedErr);
});

test("should return TextChannelDoesNotExistError", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo } = deps;

  const guildID = "guildWithSettings";
  const channelID = "dne";

  const announcement = createMockAnnouncement({
    guildID,
  });
  await announcementRepo.save(announcement);

  const input = { announcementID: announcement.id.value, guildID, channelID };
  const response = await editAnnouncementInfo(input, deps as any);

  const expectedErr = Response.fail<TextChannelDoesNotExistError>(
    new TextChannelDoesNotExistError(channelID),
  );
  t.deepEqual(response, expectedErr);
});

test("should return success response", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo } = deps;

  const guildID = "guildWithSettings";
  const channelID = "exists";

  const announcement = createMockAnnouncement({
    guildID,
  });
  await announcementRepo.save(announcement);

  const input = { announcementID: announcement.id.value, guildID, channelID };
  const response = await editAnnouncementInfo(input, deps as any);

  const announcementCopy = announcement.copy();
  const expectedAnnouncement = AnnouncementToOutput(announcementCopy);
  Object.assign(expectedAnnouncement, { channelID });
  const expected = Response.success<AnnouncementOutput>(expectedAnnouncement);

  t.deepEqual(response, expected);
});

test("should set message if announcement in progress", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo } = deps;

  const guildID = "guildWithSettings";
  const message = "A valid message";

  const announcement = createMockAnnouncement({
    guildID,
  });
  await announcementRepo.save(announcement);

  const input = { announcementID: announcement.id.value, guildID, message };
  const response = await editAnnouncementInfo(input, deps as any);

  const announcementCopy = announcement.copy();
  const expectedAnnouncement = AnnouncementToOutput(announcementCopy);
  Object.assign(expectedAnnouncement, { message });
  const expected = Response.success<AnnouncementOutput>(expectedAnnouncement);

  t.deepEqual(response, expected);
});

test("should not set time if there is no timezone", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo } = deps;

  const guildID = "guildWithNoSettings";
  const announcement = createMockAnnouncement({
    guildID,
  });
  await announcementRepo.save(announcement);

  const mScheduledTime = moment().add(2, "minutes");
  const input = {
    announcementID: announcement.id.value,
    guildID,
    scheduledTime: mScheduledTime.format(DATE_FORMAT),
  };
  const response = await editAnnouncementInfo(input, deps as any);

  const expectedErr = Response.fail<TimezoneNotSetError>(new TimezoneNotSetError());
  t.deepEqual(response, expectedErr);
});

test("should not set improperly formatted time", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo } = deps;

  const guildID = "guildWithSettings";
  const announcement = createMockAnnouncement({
    guildID,
  });
  await announcementRepo.save(announcement);

  const mScheduledTime = moment().add(2, "minutes");
  const input = {
    announcementID: announcement.id.value,
    guildID,
    scheduledTime: mScheduledTime.toISOString(),
  };
  const response = await editAnnouncementInfo(input, deps as any);

  const expectedErr = Response.fail<InvalidTimeError>(
    new InvalidTimeError(mScheduledTime.toISOString()),
  );
  t.deepEqual(response, expectedErr);
});

test("should not set past time", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo } = deps;

  const guildID = "guildWithSettings";
  const announcement = createMockAnnouncement({
    guildID,
  });
  await announcementRepo.save(announcement);

  const mScheduledTime = moment();
  const input: any = {
    announcementID: announcement.id.value,
    guildID,
    scheduledTime: mScheduledTime.format(DATE_FORMAT),
  };
  const response = await editAnnouncementInfo(input, deps as any);

  const expectedErr = Response.fail<TimeInPastError>(new TimeInPastError());
  t.deepEqual(response, expectedErr);
});

test("should set time if announcement in progress", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo, guildSettingsRepo } = deps;

  const guildID = "guildWithSettings";
  const mScheduledTime = moment().add(2, "minutes");

  const announcement = createMockAnnouncement({
    guildID,
    scheduledTime: mScheduledTime,
  });
  await announcementRepo.save(announcement);

  const settings = createMockGuildSettings({ timezone: "US/Pacific", guildID });
  await guildSettingsRepo.save(settings);

  const input = {
    announcementID: announcement.id.value,
    guildID,
    scheduledTime: mScheduledTime.format(DATE_FORMAT),
  };
  const response = await editAnnouncementInfo(input, deps as any);

  const expected = Response.success<AnnouncementOutput>(AnnouncementToOutput(announcement));
  t.deepEqual(response, expected);
});
