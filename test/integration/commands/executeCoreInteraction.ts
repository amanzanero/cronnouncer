import test, { before } from "ava";
import { stub } from "sinon";

import { MockDiscordService } from "../../test_utils/mocks/discordService";
import { makeCoreInteractionExecutor } from "../../../src/commands/base/executeCoreInteraction";
import { MockLoggerService } from "../../test_utils/mocks/loggerService";
import { AnnouncementRepo, GuildSettingsRepo } from "../../../src/core/announcement/repos";
import { LoggerService } from "../../../src/core/announcement/services/logger";
import { genTestMessage } from "../../test_utils/mocks/discordMessage";
import { MockAnnouncementRepo } from "../../test_utils/mocks/announcementRepo";
import { MockGuildSettingsRepo } from "../../test_utils/mocks/guildSettingsRepo";
import { INTERNAL_ERROR_RESPONSE } from "../../../src/commands/util/errors";

interface TestContext {
  deps: {
    announcementRepo: AnnouncementRepo;
    discordService: MockDiscordService;
    guildSettingsRepo: GuildSettingsRepo;
    loggerService: MockLoggerService;
  };
}

before(async (t) => {
  const announcementRepo = new MockAnnouncementRepo();
  const guildSettingsRepo = new MockGuildSettingsRepo();
  const discordService = new MockDiscordService();
  const loggerService = new LoggerService();
  const deps = { announcementRepo, discordService, guildSettingsRepo, loggerService };

  Object.assign(t.context, {
    deps,
  });
});

test("should send internal error message", async (t) => {
  const { deps } = t.context as TestContext;
  const executor = makeCoreInteractionExecutor(
    deps as any,
    {
      interaction: () => {
        throw new Error("unexpected error occurred in core");
      },
    } as any,
  );
  const message = genTestMessage();
  const sendStub = stub(message.channel, "send");
  sendStub.resolves();
  await executor({ message } as any);

  t.true(sendStub.calledWith(INTERNAL_ERROR_RESPONSE));
});
