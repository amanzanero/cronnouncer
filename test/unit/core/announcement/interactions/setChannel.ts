import test from "ava";
import {
  makeSetChannel,
  InputData,
} from "../../../../../src/core/announcement/interactions/setChannel";
import { Response, InteractionExecute } from "../../../../../src/lib";
import { createMockAnnouncement } from "../../../../test_utils/mocks/mockAnnouncement";
import {
  AnnouncementError,
  AnnouncementNotInProgressError,
  ChannelDoesNotExistError,
  ValidationError,
} from "../../../../../src/core/announcement/errors";
import {
  AnnouncementOutput,
  AnnouncementToOutput,
} from "../../../../../src/core/announcement/interactions/common";
import { MockDiscordService } from "../../../../test_utils/mocks/discordService";
import { MockAnnouncementRepo } from "../../../../test_utils/mocks/announcementRepo";

interface TestContext {
  repo: MockAnnouncementRepo;
  mockDiscordService: MockDiscordService;
  interaction: InteractionExecute<InputData, AnnouncementOutput | AnnouncementError>;
}

test.before((t) => {
  const repo = new MockAnnouncementRepo();
  const mockDiscordService = new MockDiscordService();
  const interaction = makeSetChannel(repo, mockDiscordService);
  Object.assign(mockDiscordService.channels, {
    exists: true,
  });
  Object.assign(t.context, { repo, interaction, mockDiscordService });
});

test("should return validation error with bad input", async (t) => {
  const { interaction } = t.context as TestContext;

  const response = await interaction({
    guildID: "1",
    channel: undefined,
  } as any);

  const expectedErr = Response.fail<ValidationError>(
    new ValidationError("channel is null or undefined"),
  );
  t.deepEqual(response, expectedErr);
});

test("should return AnnouncementNotInProgressError", async (t) => {
  const { interaction } = t.context as TestContext;

  const guildID = "1";
  const response = await interaction({
    guildID,
    channel: "some channel",
  });

  const expectedErr = Response.fail<AnnouncementNotInProgressError>(
    new AnnouncementNotInProgressError(guildID),
  );
  t.deepEqual(response, expectedErr);
});

test("should return ChannelDoesNotExistError", async (t) => {
  const { interaction, repo } = t.context as TestContext;

  const guildID = "2";
  const channel = "dne";

  const announcement = createMockAnnouncement({
    guildID,
  });
  await repo.save(announcement);

  const response = await interaction({
    guildID,
    channel,
  });

  const expectedErr = Response.fail<ChannelDoesNotExistError>(
    new ChannelDoesNotExistError(channel, guildID),
  );
  t.deepEqual(response, expectedErr);
});

test("should return success response", async (t) => {
  const { interaction, repo } = t.context as TestContext;

  const guildID = "3";
  const channel = "exists";

  const announcement = createMockAnnouncement({
    guildID,
  });
  await repo.save(announcement);
  const response = await interaction({
    guildID,
    channel,
  });

  const announcementCopy = announcement.copy();
  const expectedAnnouncement = AnnouncementToOutput(announcementCopy);
  Object.assign(expectedAnnouncement, { channel });
  const expected = Response.success<AnnouncementOutput>(expectedAnnouncement);

  t.deepEqual(response, expected);
});
