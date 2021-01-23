import test, { after, before } from "ava";
import { Repository } from "typeorm";
import moment from "moment-timezone";
import { v4 } from "uuid";

import * as scheduleCMD from "../../../src/commands/schedule";
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
import { createMockAnnouncement } from "../../test_utils/mocks/announcement";
import { AnnouncementStatus } from "../../../src/core/announcement/domain/announcement/Status";
import { TimeService } from "../../../src/core/announcement/services/time";
import { CronService } from "../../../src/core/announcement/services/cron";
import { makeMockDiscordClient } from "../../test_utils/mocks/discordClient";

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

const guildID = "schedule-test-id";

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
  const timeService = new TimeService();

  const mockDiscordClient = makeMockDiscordClient();
  const cronService = new CronService(mockDiscordClient as any);
  const deps = {
    announcementRepo,
    discordService,
    guildSettingsRepo,
    loggerService,
    identifierService,
    timeService,
    cronService,
  };
  const execute = makeCoreInteractionExecutor(deps as any, scheduleCMD);

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

test("announcement gets scheduled", async (t) => {
  const { announcementStore, execute, deps } = t.context as TestContext;

  const announcement = createMockAnnouncement({
    message: "an announcement",
    scheduledTime: moment().add(1, "day"),
    channelID: v4(),
    guildID,
    status: AnnouncementStatus.unscheduled,
  });
  await deps.announcementRepo.save(announcement);

  const mockMessage = genTestMessage({ guildID });
  const args = new Args(announcement.shortID.toString());

  await execute({
    meta: {},
    message: mockMessage as any,
    args,
  });

  const scheduled = await announcementStore.findOne({ announcement_id: announcement.id.value });
  t.is(scheduled?.status, AnnouncementStatus.scheduled);
});
