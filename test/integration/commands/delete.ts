import test, { after, before } from "ava";
import { Repository } from "typeorm";

import { MockDiscordService } from "../../test_utils/mocks/discordService";
import * as deleteCMD from "../../../src/commands/delete";
import { Command } from "../../../src/commands/definitions";
import { Args } from "../../../src/commands/definitions/Args";
import { makeCoreInteractionExecutor } from "../../../src/commands/base/executeCoreInteraction";
import { MockLoggerService } from "../../test_utils/mocks/loggerService";
import { initDB } from "../../../src/infra/typeorm";
import { AnnouncementRepo, GuildSettingsRepo } from "../../../src/core/announcement/repos";
import { LoggerService } from "../../../src/core/announcement/services/logger";
import { genTestMessage } from "../../test_utils/mocks/discordMessage";
import { Announcement, GuildSettings } from "../../../src/infra/typeorm/models";
import { IdentifierService } from "../../../src/core/announcement/services/identifierService";
import { createMockAnnouncement } from "../../test_utils/mocks/announcement";

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

const guildID = "delete-test-id";

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
  const execute = makeCoreInteractionExecutor(deps as any, deleteCMD);

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

test("announcement gets deleted", async (t) => {
  const { announcementStore, deps, execute } = t.context as TestContext;

  const announcement = createMockAnnouncement({ guildID });
  await deps.announcementRepo.save(announcement);

  const mockMessage = genTestMessage({ guildID });
  const args = new Args(announcement.shortID.toString());
  await execute({
    meta: {},
    message: mockMessage as any,
    args,
  });

  const deleted = await announcementStore.findOne({
    short_id: announcement.shortID,
    guild_id: guildID,
  });
  t.is(deleted, undefined);
});
