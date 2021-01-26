import test, { after, before } from "ava";
import { Repository } from "typeorm";
import { stub } from "sinon";

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
import { Announcement, GuildSettings } from "../../../src/infra/typeorm/models";
import { PREFIX } from "../../../src/constants";

interface TestContext {
  deps: {
    announcementRepo: AnnouncementRepo;
    discordService: MockDiscordService;
    guildSettingsRepo: GuildSettingsRepo;
    loggerService: MockLoggerService;
  };
  execute: Command["execute"];

  announcementStore: Repository<Announcement>;
  guildSettingsStore: Repository<GuildSettings>;
  closeConnection: () => Promise<any>;
}

const guildID = "set-channel-test-id";

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

  Object.assign(discordService.channels, { "1234": true });

  await guildSettingsRepo.save(createMockGuildSettings({ guildID, timezone: "US/Pacific" }));
  Object.assign(t.context, {
    deps,
    execute,

    announcementStore,
    guildSettingsStore,
    closeConnection,
  });
});

after(async (t) => {
  const { announcementStore, guildSettingsStore, closeConnection } = t.context as TestContext;

  await Promise.all([
    announcementStore.delete({ guild_id: guildID }),
    guildSettingsStore.delete({ guild_id: guildID }),
  ]);
  await closeConnection();
});

test("channel gets set", async (t) => {
  const { deps, execute } = t.context as TestContext;

  const newAnnouncement = createMockAnnouncement({ guildID });
  await deps.announcementRepo.save(newAnnouncement);

  const mockMessage = genTestMessage({ guildID });
  const args = new Args(`${newAnnouncement.shortID} <#1234>`);
  await execute({
    meta: {},
    message: mockMessage as any,
    args,
  });

  const announcement = await deps.announcementRepo.findByID(newAnnouncement.id.value);
  t.is(announcement?.channelID, "1234");
});

test("no id or channel responds with error message", async (t) => {
  const { deps, execute } = t.context as TestContext;

  const newAnnouncement = createMockAnnouncement({ guildID });
  await deps.announcementRepo.save(newAnnouncement);

  const mockMessage = genTestMessage({ guildID });
  const sendStub = stub(mockMessage.channel, "send");
  const args = new Args("");

  await execute({
    meta: {},
    message: mockMessage as any,
    args,
  });

  t.true(
    sendStub.calledWith(
      `announcementID is not a number\n> Type \`${PREFIX}help\` for proper usage.`,
    ),
  );

  const announcement = await deps.announcementRepo.findByID(newAnnouncement.id.value);
  t.is(announcement?.channelID, null);
});

test("incorrect channel returns a respond", async (t) => {
  const { deps, execute } = t.context as TestContext;

  const newAnnouncement = createMockAnnouncement({ guildID });
  await deps.announcementRepo.save(newAnnouncement);

  const mockMessage = genTestMessage({ guildID });
  const sendStub = stub(mockMessage.channel, "send");
  const args = new Args(`${newAnnouncement.shortID} <#5555>`);

  await execute({
    meta: {},
    message: mockMessage as any,
    args,
  });

  t.true(
    sendStub.calledWith(
      `Channel \`#5555\` is not the name of a text channel in this server.\n> Type \`${PREFIX}help\` for proper usage.`,
    ),
  );

  const announcement = await deps.announcementRepo.findByID(newAnnouncement.id.value);
  t.is(announcement?.channelID, null);
});
