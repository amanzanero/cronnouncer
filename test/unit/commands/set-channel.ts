import test from "ava";
import { MockAnnouncementRepo } from "../../test_utils/mocks/announcementRepo";
import { MockDiscordService } from "../../test_utils/mocks/discordService";
import { makeSetChannelCMD } from "../../../src/commands/set-channel";
import { Command } from "../../../src/commands/definitions";
import { createMockAnnouncement } from "../../test_utils/mocks/mockAnnouncement";
import { Args } from "../../../src/commands/config/Args";
import { GuildID } from "../../../src/core/announcement/domain";

interface TestContext {
  mockRepo: MockAnnouncementRepo;
  mockService: MockDiscordService;
  cmd: Command;
}

test.before(async (t) => {
  const mockRepo = new MockAnnouncementRepo();
  const mockService = new MockDiscordService();
  const cmd = makeSetChannelCMD({ announcementRepo: mockRepo, discordService: mockService });

  const newAnnouncement = createMockAnnouncement({ guildID: "1" });
  await mockRepo.save(newAnnouncement);

  Object.assign(t.context, { mockRepo, mockService, cmd });
});

test("channel gets set", async (t) => {
  const { mockRepo, mockService, cmd } = t.context as TestContext;
  Object.assign(mockService.channels, { "1234": true });
  const mockMessage = {
    guild: { id: "1" },
    channel: { send: async (s: string) => s },
  };
  const args = new Args("<#1234>");
  await cmd.execute(mockMessage as any, args);

  const announcement = await mockRepo.findWorkInProgressByGuildID(GuildID.create("1").getValue());
  t.is(announcement?.channel?.value, "1234");
});
