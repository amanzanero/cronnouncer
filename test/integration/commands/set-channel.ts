import test, { before } from "ava";
import { MockAnnouncementRepo } from "../../test_utils/mocks/announcementRepo";
import { MockDiscordService } from "../../test_utils/mocks/discordService";
import * as setChannelCMD from "../../../src/commands/set-channel";
import { Command } from "../../../src/commands/definitions";
import { createMockAnnouncement } from "../../test_utils/mocks/announcement";
import { Args } from "../../../src/commands/definitions/Args";
import { makeExecuteBase } from "../../../src/commands/base/executeBase";
import { MockGuildSettingsRepo } from "../../test_utils/mocks/guildSettingsRepo";
import { createMockGuildSettings } from "../../test_utils/mocks/guildSettings";
import { MockLoggerService } from "../../test_utils/mocks/loggerService";

interface TestContext {
  deps: {
    announcementRepo: MockAnnouncementRepo;
    discordService: MockDiscordService;
    guildSettingsRepo: MockGuildSettingsRepo;
    loggerService: MockLoggerService;
  };
  execute: Command["execute"];
}

before(async (t) => {
  const announcementRepo = new MockAnnouncementRepo();
  const discordService = new MockDiscordService();
  const guildSettingsRepo = new MockGuildSettingsRepo();
  const loggerService = new MockLoggerService();
  const deps = { announcementRepo, discordService, guildSettingsRepo, loggerService };
  const execute = makeExecuteBase(deps as any, setChannelCMD);

  await Object.assign(t.context, { deps, execute });
});

test("channel gets set", async (t) => {
  const { deps, execute } = t.context as TestContext;

  const newAnnouncement = createMockAnnouncement({ guildID: "1" });
  await deps.announcementRepo.save(newAnnouncement);
  await deps.guildSettingsRepo.save(
    createMockGuildSettings({ guildID: "1", timezone: "US/Pacific" }),
  );

  Object.assign(deps.discordService.channels, { "1234": true });
  const mockMessage = {
    guild: { id: "1" },
    channel: { send: async (s: string) => s },
  };
  const args = new Args(`${newAnnouncement.shortID} <#1234>`);
  await execute({ requestID: "1", message: mockMessage as any, args });

  const announcement = await deps.announcementRepo.findByID(newAnnouncement.id.value);
  t.is(announcement?.channelID, "1234");
});
