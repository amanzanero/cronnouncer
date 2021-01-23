import test, { after, before } from "ava";
import { v4 } from "uuid";
import { MockDiscordService } from "../../test_utils/mocks/discordService";
import * as setChannelCMD from "../../../src/commands/set-channel";
import { Command } from "../../../src/commands/definitions";
import { createMockAnnouncement } from "../../test_utils/mocks/announcement";
import { Args } from "../../../src/commands/definitions/Args";
import { makeCoreInteractionExecutor } from "../../../src/commands/base/executeCoreInteraction";
import { createMockGuildSettings } from "../../test_utils/mocks/guildSettings";
import { MockLoggerService } from "../../test_utils/mocks/loggerService";
import { initDB } from "../../../src/infra/typeorm";
import { AnnouncementRepo, GuildSettingsRepo } from "../../../src/core/announcement/repos";
import { LoggerService } from "../../../src/core/announcement/services/logger";
import { genTestMessage } from "../../test_utils/mocks/discordMessage";

interface TestContext {
  deps: {
    announcementRepo: AnnouncementRepo;
    discordService: MockDiscordService;
    guildSettingsRepo: GuildSettingsRepo;
    loggerService: MockLoggerService;
  };
  execute: Command["execute"];
}

before(async (t) => {
  const {
    storesDisconnect: closeConnection,
    stores: { announcementStore, guildSettingsStore },
  } = await initDB();
  const announcementRepo = new AnnouncementRepo(announcementStore);
  const guildSettingsRepo = new GuildSettingsRepo(guildSettingsStore);
  const discordService = new MockDiscordService();
  const loggerService = new LoggerService();
  const deps = { announcementRepo, discordService, guildSettingsRepo, loggerService };
  const execute = makeCoreInteractionExecutor(deps as any, setChannelCMD);

  Object.assign(t.context, { deps, execute, closeConnection });
});

after(async (t) => {
  await (t.context as any).closeConnection();
});

test("channel gets set", async (t) => {
  const { deps, execute } = t.context as TestContext;

  const guildID = v4();
  const newAnnouncement = createMockAnnouncement({ guildID });
  await deps.announcementRepo.save(newAnnouncement);
  await deps.guildSettingsRepo.save(createMockGuildSettings({ guildID, timezone: "US/Pacific" }));

  Object.assign(deps.discordService.channels, { "1234": true });
  const mockMessage = genTestMessage({ guildID });
  const args = new Args(`${newAnnouncement.shortID} <#1234>`);
  await execute({
    meta: {
      requestID: "1",
    },
    message: mockMessage as any,
    args,
  });

  const announcement = await deps.announcementRepo.findByID(newAnnouncement.id.value);
  t.is(announcement?.channelID, "1234");
});
