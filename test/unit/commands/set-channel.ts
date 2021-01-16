import test from "ava";
import { MockAnnouncementRepo } from "../../test_utils/mocks/announcementRepo";
import { MockDiscordService } from "../../test_utils/mocks/discordService";
import * as setChannelCMD from "../../../src/commands/set-channel";
import { Command } from "../../../src/commands/definitions";
import { createMockAnnouncement } from "../../test_utils/mocks/announcement";
import { Args } from "../../../src/commands/definitions/Args";
import { makeExecuteBase } from "../../../src/commands/executeBase";
import { MockAnnouncementSettingsRepo } from "../../test_utils/mocks/announcementSettingsRepo";
import { createMockAnnouncementSettings } from "../../test_utils/mocks/announcementSettings";
import { MockLoggerService } from "../../test_utils/mocks/loggerService";

interface TestContext {
  deps: {
    announcementRepo: MockAnnouncementRepo;
    discordService: MockDiscordService;
    announcementSettingsRepo: MockAnnouncementSettingsRepo;
    loggerService: MockLoggerService;
  };
  execute: Command["execute"];
}

test.before(async (t) => {
  const announcementRepo = new MockAnnouncementRepo();
  const discordService = new MockDiscordService();
  const announcementSettingsRepo = new MockAnnouncementSettingsRepo();
  const loggerService = new MockLoggerService();
  const deps = { announcementRepo, discordService, announcementSettingsRepo, loggerService };
  const execute = makeExecuteBase(deps as any, setChannelCMD);

  const newAnnouncement = createMockAnnouncement({ guildID: "1", id: "testID" });
  await announcementRepo.save(newAnnouncement);
  await announcementSettingsRepo.save(
    createMockAnnouncementSettings({ guildID: "1", timezone: "US/Pacific" }),
  );
  await Object.assign(t.context, { deps, execute });
});

test("channel gets set", async (t) => {
  const { deps, execute } = t.context as TestContext;
  Object.assign(deps.discordService.channels, { "1234": true });
  const mockMessage = {
    guild: { id: "1" },
    channel: { send: async (s: string) => s },
  };
  const args = new Args("testID <#1234>");
  await execute({ requestID: "1", message: mockMessage as any, args });

  const announcement = await deps.announcementRepo.findByID("testID");
  t.is(announcement?.channel?.value, "1234");
});
