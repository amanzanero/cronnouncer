import test from "ava";
import { setChannel } from "../../../../../src/core/announcement/interactions/setChannel";
import { Response } from "../../../../../src/lib";
import { createMockAnnouncement } from "../../../../test_utils/mocks/announcement";
import {
  AnnouncementNotInProgressError,
  TextChannelDoesNotExistError,
  ValidationError,
} from "../../../../../src/core/announcement/errors";
import {
  AnnouncementOutput,
  AnnouncementToOutput,
} from "../../../../../src/core/announcement/interactions/common";
import { MockDiscordService } from "../../../../test_utils/mocks/discordService";
import { MockAnnouncementRepo } from "../../../../test_utils/mocks/announcementRepo";
import { ICronService } from "../../../../../src/core/announcement/services/cron";

interface TestContext {
  deps: {
    announcementRepo: MockAnnouncementRepo;
    discordService: MockDiscordService;
    cronService: ICronService; // not actually used
    requestID: string;
  };
}

test.before((t) => {
  const announcementRepo = new MockAnnouncementRepo();
  const discordService = new MockDiscordService();
  Object.assign(discordService.channels, {
    exists: true,
  });
  Object.assign(t.context, {
    deps: {
      announcementRepo,
      discordService,
    },
  });
});

test("should return validation error with bad input", async (t) => {
  const { deps } = t.context as TestContext;

  const input: any = { guildID: "1", channel: undefined };
  const response = await setChannel(input, deps as any);

  const expectedErr = Response.fail<ValidationError>(
    new ValidationError("channel is null or undefined"),
  );
  t.deepEqual(response, expectedErr);
});

test("should return AnnouncementNotInProgressError", async (t) => {
  const { deps } = t.context as TestContext;

  const guildID = "1";
  const input: any = { guildID, channel: "some channel" };
  const response = await setChannel(input, deps as any);

  const expectedErr = Response.fail<AnnouncementNotInProgressError>(
    new AnnouncementNotInProgressError(guildID),
  );
  t.deepEqual(response, expectedErr);
});

test("should return TextChannelDoesNotExistError", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo } = deps;

  const guildID = "2";
  const channel = "dne";

  const announcement = createMockAnnouncement({
    guildID,
  });
  await announcementRepo.save(announcement);

  const input = { guildID, channel };
  const response = await setChannel(input, deps as any);

  const expectedErr = Response.fail<TextChannelDoesNotExistError>(
    new TextChannelDoesNotExistError(channel),
  );
  t.deepEqual(response, expectedErr);
});

test("should return success response", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo } = deps;

  const guildID = "3";
  const channel = "exists";

  const announcement = createMockAnnouncement({
    guildID,
  });
  await announcementRepo.save(announcement);

  const input = { guildID, channel };
  const response = await setChannel(input, deps as any);

  const announcementCopy = announcement.copy();
  const expectedAnnouncement = AnnouncementToOutput(announcementCopy);
  Object.assign(expectedAnnouncement, { channel });
  const expected = Response.success<AnnouncementOutput>(expectedAnnouncement);

  t.deepEqual(response, expected);
});
