import test, { after, before } from "ava";
import { Repository } from "typeorm";
import { stub } from "sinon";
import moment from "moment-timezone";

import * as setTimeCMD from "../../../src/commands/set-time";
import { MockDiscordService } from "../../test_utils/mocks/discordService";
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
import { TimeService } from "../../../src/core/announcement/services/time";
import { DATE_FORMAT } from "../../../src/core/announcement/services/cron";
import { ScheduledTime } from "../../../src/core/announcement/domain/announcement";

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

const guildID = "set-time-test-id";

before(async (t) => {
  const {
    storesDisconnect: closeConnection,
    stores: { announcementStore, guildSettingsStore },
  } = await initDB();
  const announcementRepo = new AnnouncementRepo(announcementStore);
  const guildSettingsRepo = new GuildSettingsRepo(guildSettingsStore);
  const discordService = new MockDiscordService();
  const loggerService = new LoggerService();
  const timeService = new TimeService();
  const deps = { announcementRepo, discordService, guildSettingsRepo, loggerService, timeService };
  const execute = makeCoreInteractionExecutor(deps as any, setTimeCMD);

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

test("time gets set", async (t) => {
  const { deps, execute, announcementStore } = t.context as TestContext;

  const newAnnouncement = createMockAnnouncement({ guildID });
  await deps.announcementRepo.save(newAnnouncement);

  const mockMessage = genTestMessage({ guildID });
  const mTime = moment().add(1, "day");
  const args = new Args(`${newAnnouncement.shortID} ${mTime.format(DATE_FORMAT)}`);
  await execute({
    meta: {},
    message: mockMessage as any,
    args,
  });

  const announcement = await announcementStore.findOne({
    announcement_id: newAnnouncement.id.value,
  });
  t.is(announcement?.scheduled_time, mTime.format(DATE_FORMAT));
});

test("No time gives a validation error", async (t) => {
  const { deps, execute } = t.context as TestContext;

  const newAnnouncement = createMockAnnouncement({ guildID });
  await deps.announcementRepo.save(newAnnouncement);

  const mockMessage = genTestMessage({ guildID });
  const sendStub = stub(mockMessage.channel, "send");
  const args = new Args(newAnnouncement.shortID.toString());

  await execute({
    meta: {},
    message: mockMessage as any,
    args,
  });

  t.true(
    sendStub.calledWith(
      `No time was provided\n> Usage: \`#set-time {announcementID} {MM/DD/YYYY hh:mm am/pm}\``,
    ),
  );
  const announcement = await deps.announcementRepo.findByID(newAnnouncement.id.value);
  t.is(announcement?.scheduledTime, undefined);
});

test("Invalid time format gives a validation error", async (t) => {
  const { deps, execute } = t.context as TestContext;

  const newAnnouncement = createMockAnnouncement({ guildID });
  const mTime = moment().add(1, "day");
  await deps.announcementRepo.save(newAnnouncement);

  const mockMessage = genTestMessage({ guildID });
  const sendStub = stub(mockMessage.channel, "send");
  const args = new Args(`${newAnnouncement.shortID} ${mTime.toISOString()}`);

  await execute({
    meta: {},
    message: mockMessage as any,
    args,
  });

  t.true(
    sendStub.calledWith(
      `${ScheduledTime.invalidTimeMessage(
        mTime.toISOString(),
      )}\n> Usage: \`#set-time {announcementID} {MM/DD/YYYY hh:mm am/pm}\``,
    ),
  );
  const announcement = await deps.announcementRepo.findByID(newAnnouncement.id.value);
  t.is(announcement?.scheduledTime, undefined);
});
