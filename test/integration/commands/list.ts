import test, { after, before } from "ava";
import { stub } from "sinon";
import { Repository } from "typeorm";

import { announcementsTable, makeListCMD } from "../../../src/commands/list";
import { MockDiscordService } from "../../test_utils/mocks/discordService";
import { Command } from "../../../src/commands/definitions";
import { Args } from "../../../src/commands/definitions/Args";
import { createMockGuildSettings } from "../../test_utils/mocks/guildSettings";
import { MockLoggerService } from "../../test_utils/mocks/loggerService";
import { initDB } from "../../../src/infra/typeorm";
import { AnnouncementRepo, GuildSettingsRepo } from "../../../src/core/announcement/repos";
import { LoggerService } from "../../../src/core/announcement/services/logger";
import { genTestMessage } from "../../test_utils/mocks/discordMessage";
import { Announcement, GuildSettings } from "../../../src/infra/typeorm/models";
import { IdentifierService } from "../../../src/core/announcement/services/identifierService";
import { createMockAnnouncement } from "../../test_utils/mocks/announcement";
import { INTERNAL_ERROR_RESPONSE } from "../../../src/commands/util/errors";

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

const guildID = "list-test-id";
const COUNT = 15;

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
  const { execute } = makeListCMD();
  const promises: Promise<any>[] = [];
  for (let i = 0; i < COUNT; i++) {
    promises.push(announcementRepo.save(createMockAnnouncement({ guildID })));
  }
  await Promise.all([
    ...promises,
    guildSettingsRepo.save(createMockGuildSettings({ guildID, timezone: "US/Pacific" })),
  ]);

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

test("send formatted announcements", async (t) => {
  const { announcementStore, execute } = t.context as TestContext;

  const mockMessage = genTestMessage({ guildID });
  const sendStub = stub(mockMessage.channel, "send");

  const args = new Args("");
  await execute({
    meta: {},
    message: mockMessage as any,
    args,
  });

  const announcements = await announcementStore.find({ guild_id: guildID });

  t.deepEqual(
    sendStub.args.map((a) => a[0]),
    announcementsTable(announcements, "US/Pacific") as any,
  );
});

test("send message notifying of no announcements", async (t) => {
  const { execute } = t.context as TestContext;

  const mockMessage = genTestMessage({ guildID: "none" });
  const sendStub = stub(mockMessage.channel, "send");

  const args = new Args("");
  await execute({
    meta: {},
    message: mockMessage as any,
    args,
  });

  t.deepEqual(sendStub.args, [["There are no announcements created for this server."]]);
});

test("sends internal error", async (t) => {
  const { execute } = t.context as TestContext;

  const mockMessage = genTestMessage({ guildID: "none" });
  const sendStub = stub(mockMessage.channel, "send");
  sendStub.onFirstCall().throws(new Error("Discord error"));

  const args = new Args("");
  await execute({
    meta: {},
    message: mockMessage as any,
    args,
  });

  t.deepEqual(sendStub.secondCall.args, [INTERNAL_ERROR_RESPONSE]);
});
