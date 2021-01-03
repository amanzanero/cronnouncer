import test from "ava";
import { MockAnnouncementRepo } from "../../test_utils/mocks/announcementRepo";
import { MockDiscordService } from "../../test_utils/mocks/discordService";
import * as setChannelCMD from "../../../src/commands/set-channel";
import { Command } from "../../../src/commands/definitions";
import { createMockAnnouncement } from "../../test_utils/mocks/mockAnnouncement";
import { Args } from "../../../src/commands/definitions/Args";
import { GuildID } from "../../../src/core/announcement/domain";
import { makeExecuteBase } from "../../../src/commands/executeBase";

interface TestContext {
  announcementRepo: MockAnnouncementRepo;
  discordService: MockDiscordService;
  execute: Command["execute"];
}

test.before(async (t) => {
  const announcementRepo = new MockAnnouncementRepo();
  const discordService = new MockDiscordService();
  const deps = { announcementRepo, discordService };
  const execute = makeExecuteBase(deps, setChannelCMD);

  const newAnnouncement = createMockAnnouncement({ guildID: "1" });
  await announcementRepo.save(newAnnouncement);

  Object.assign(t.context, { announcementRepo, discordService, execute });
});

test("channel gets set", async (t) => {
  const { announcementRepo, discordService, execute } = t.context as TestContext;
  Object.assign(discordService.channels, { "1234": true });
  const mockMessage = {
    guild: { id: "1" },
    channel: { send: async (s: string) => s },
  };
  const args = new Args("<#1234>");
  await execute(mockMessage as any, args);

  const announcement = await announcementRepo.findWorkInProgressByGuildID(
    GuildID.create("1").getValue(),
  );
  t.is(announcement?.channel?.value, "1234");
});
