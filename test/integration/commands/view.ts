import test, { after, before } from "ava";
import { stub } from "sinon";
import { Repository } from "typeorm";
import { MessageEmbed } from "discord.js";

import { makeViewCMD } from "../../../src/commands/view";
import { Command } from "../../../src/commands/definitions";
import { Args } from "../../../src/commands/definitions/Args";
import { initDB } from "../../../src/infra/typeorm";
import { AnnouncementRepo } from "../../../src/core/announcement/repos";
import { genTestMessage } from "../../test_utils/mocks/discordMessage";
import { Announcement, GuildSettings } from "../../../src/infra/typeorm/models";
import { createMockAnnouncement } from "../../test_utils/mocks/announcement";
import { announcementStringEmbed } from "../../../src/commands/util/announcementString";
import { AnnouncementToOutput } from "../../../src/core/announcement/interactions/common";
import { INTERNAL_ERROR_RESPONSE } from "../../../src/commands/util/errors";

interface TestContext {
  deps: {
    announcementRepo: AnnouncementRepo;
  };

  execute: Command["execute"];
  announcementStore: Repository<Announcement>;
  guildSettingsStore: Repository<GuildSettings>;
  closeConnection: () => Promise<any>;
}

const guildID = "view-test-id";

before(async (t) => {
  const {
    storesDisconnect: closeConnection,
    stores: { announcementStore, guildSettingsStore },
  } = await initDB();
  const announcementRepo = new AnnouncementRepo(announcementStore);
  const deps = {
    announcementRepo,
  };
  const { execute } = makeViewCMD();

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

test("should send an embed", async (t) => {
  const {
    execute,
    deps: { announcementRepo },
  } = t.context as TestContext;

  const announcement = createMockAnnouncement({ guildID });
  await announcementRepo.save(announcement);

  const mockMessage = genTestMessage({ guildID });
  const sendStub = stub(mockMessage.channel, "send");

  const args = new Args(announcement.shortID.toString());
  await execute({
    meta: {},
    message: mockMessage as any,
    args,
  });

  const expectedEmbed = announcementStringEmbed(AnnouncementToOutput(announcement));
  expectedEmbed.timestamp = null;

  const actualEmbed = sendStub.args[0][0] as MessageEmbed;
  actualEmbed.timestamp = null;
  t.deepEqual(actualEmbed, expectedEmbed);
});

test("should respond with validation error", async (t) => {
  const {
    execute,
    deps: { announcementRepo },
  } = t.context as TestContext;

  const announcement = createMockAnnouncement({ guildID });
  await announcementRepo.save(announcement);

  const mockMessage = genTestMessage({ guildID });
  const sendStub = stub(mockMessage.channel, "send");

  const args = new Args("");
  await execute({
    meta: {},
    message: mockMessage as any,
    args,
  });

  t.deepEqual(sendStub.args[0], ["No announcementID was provided"]);
});

test("should respond with no announcement found", async (t) => {
  const { execute } = t.context as TestContext;

  const mockMessage = genTestMessage({ guildID });
  const sendStub = stub(mockMessage.channel, "send");

  const args = new Args("101");
  await execute({
    meta: {},
    message: mockMessage as any,
    args,
  });

  t.deepEqual(sendStub.args[0], [`No announcement found with id \`101\``]);
});

test("should respond with internal error", async (t) => {
  const {
    execute,
    deps: { announcementRepo },
  } = t.context as TestContext;

  const announcement = createMockAnnouncement({ guildID });
  await announcementRepo.save(announcement);

  const mockMessage = genTestMessage({ guildID });
  const sendStub = stub(mockMessage.channel, "send");
  sendStub.onFirstCall().throws(new Error("discord error"));

  const args = new Args(announcement.shortID.toString());
  await execute({
    meta: {},
    message: mockMessage as any,
    args,
  });

  t.deepEqual(sendStub.args[1], [INTERNAL_ERROR_RESPONSE]);
});
