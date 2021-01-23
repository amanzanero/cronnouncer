import test, { after, before } from "ava";
import { Repository } from "typeorm";
import { stub } from "sinon";

import * as timezoneCMD from "../../../src/commands/timezone";
import { MockDiscordService } from "../../test_utils/mocks/discordService";
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
import { Timezone } from "../../../src/core/announcement/domain/guildSettings";

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

const guildID = "timezone-test-id";
const invalidGuildID = "timezone-invalid-id";

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
  const execute = makeCoreInteractionExecutor(deps as any, timezoneCMD);

  await guildSettingsRepo.save(createMockGuildSettings({ guildID }));
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

test("timezone gets set", async (t) => {
  const { guildSettingsStore, execute } = t.context as TestContext;

  const mockMessage = genTestMessage({ guildID });
  const args = new Args("US/Pacific");
  await execute({
    meta: {},
    message: mockMessage as any,
    args,
  });

  const gSettings = await guildSettingsStore.findOne({ guild_id: guildID });
  t.is(gSettings?.timezone, "US/Pacific");
});

test("responds with timezone validation error", async (t) => {
  const { execute, guildSettingsStore } = t.context as TestContext;

  const mockMessage = genTestMessage({ guildID: invalidGuildID });
  const sendStub = stub(mockMessage.channel, "send");
  const args = new Args("US/dne");

  await execute({
    meta: {},
    message: mockMessage as any,
    args,
  });
  t.is(
    sendStub.args[0][0],
    `${Timezone.invalidTimezoneMessage("US/dne")}\n> Type \`#help\` for proper usage.`,
  );

  const gSettings = await guildSettingsStore.findOne({ guild_id: invalidGuildID });
  t.is(gSettings?.timezone, undefined);
});
