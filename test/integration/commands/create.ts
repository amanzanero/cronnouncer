import test, { after, before } from "ava";
import { Repository } from "typeorm";
import { stub } from "sinon";

import { MockDiscordService } from "../../test_utils/mocks/discordService";
import * as createCMD from "../../../src/commands/create";
import { Command } from "../../../src/commands/definitions";
import { Args } from "../../../src/commands/definitions/Args";
import { makeCoreInteractionExecutor } from "../../../src/commands/base/executeCoreInteraction";
import { createMockGuildSettings } from "../../test_utils/mocks/guildSettings";
import { MockLoggerService } from "../../test_utils/mocks/loggerService";
import { initDB } from "../../../src/infra/typeorm";
import { AnnouncementRepo, GuildSettingsRepo } from "../../../src/core/announcement/repos";
import { LoggerService } from "../../../src/core/announcement/services/logger";
import { genTestMessage } from "../../test_utils/mocks/discordMessage";
import { Announcement, GuildSettings } from "../../../src/infra/typeorm/models";
import { IdentifierService } from "../../../src/core/announcement/services/identifierService";
import { TimezoneNotSetError } from "../../../src/core/announcement/errors";

interface TestContext {
  deps: {
    announcementRepo: AnnouncementRepo;
    discordService: MockDiscordService;
    guildSettingsRepo: GuildSettingsRepo;
    loggerService: MockLoggerService;
    identifierService: IdentifierService;
  };
  execute: Command["execute"];

  announcementStore: Repository<Announcement>;
  guildSettingsStore: Repository<GuildSettings>;
  closeConnection: () => Promise<any>;
}

const guildID = "create-test-id";
const nextShortID = 5;

before(async (t) => {
  const {
    storesDisconnect: closeConnection,
    stores: { announcementStore, guildSettingsStore },
  } = await initDB();
  const announcementRepo = new AnnouncementRepo(announcementStore);
  const guildSettingsRepo = new GuildSettingsRepo(guildSettingsStore);
  const discordService = new MockDiscordService();
  const loggerService = new LoggerService();
  const identifierService = new IdentifierService();
  const deps = {
    announcementRepo,
    discordService,
    guildSettingsRepo,
    loggerService,
    identifierService,
  };
  const execute = makeCoreInteractionExecutor(deps as any, createCMD);

  await guildSettingsRepo.save(
    createMockGuildSettings({ guildID, timezone: "US/Pacific", nextShortID }),
  );
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

test("announcement gets created", async (t) => {
  const { announcementStore, execute } = t.context as TestContext;

  const mockMessage = genTestMessage({ guildID });
  const args = new Args("");
  await execute({
    meta: {},
    message: mockMessage as any,
    args,
  });

  const created = await announcementStore.findOne({ short_id: nextShortID, guild_id: guildID });
  t.not(created, undefined);
});

test("responds with timezone not set error", async (t) => {
  const { announcementStore, execute } = t.context as TestContext;

  const mockMessage = genTestMessage({ guildID: "dne" });
  const sendStub = stub(mockMessage.channel, "send");
  const args = new Args("");

  await execute({
    meta: {},
    message: mockMessage as any,
    args,
  });

  t.is(
    sendStub.args[0][0],
    `${new TimezoneNotSetError().message}\n> Usage: \`#timezone {timezone}\``,
  );

  const shouldntExist = await announcementStore.findOne({ guild_id: "dne" });
  t.is(shouldntExist, undefined);
});
