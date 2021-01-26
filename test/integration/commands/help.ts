import test, { before } from "ava";
import { spy, stub } from "sinon";
import { MessageEmbed } from "discord.js";

import { helpEmbed, makeHelpCMD } from "../../../src/commands/help";
import { Command } from "../../../src/commands/definitions";
import { Args } from "../../../src/commands/definitions/Args";
import { genTestMessage } from "../../test_utils/mocks/discordMessage";
import { logger } from "../../../src/infra/logger";

interface TestContext {
  execute: Command["execute"];
}

const guildID = "delete-test-id";

before(async (t) => {
  const { execute } = makeHelpCMD();
  const errorLogSpy = spy(logger, "error");
  Object.assign(t.context, {
    execute,
    errorLogSpy,
  });
});

test("help message gets sent", async (t) => {
  const { execute } = t.context as TestContext;
  const mockMessage = genTestMessage({ guildID });
  const sendStub = spy(mockMessage.channel, "send");

  const args = new Args("");
  await execute({
    meta: {},
    message: mockMessage as any,
    args,
  });

  const result = sendStub.firstCall.args[0];
  (result as MessageEmbed).timestamp = null;

  const expected = helpEmbed();
  expected.timestamp = null;

  t.deepEqual(result, expected);
});

test("internal error message gets sent", async (t) => {
  const { execute } = t.context as TestContext;
  const mockMessage = genTestMessage({ guildID });
  const sendStub = stub(mockMessage.channel, "send");

  const e = new Error("A discord error");
  sendStub.onFirstCall().throws(e);

  const args = new Args("");
  await execute({
    meta: {},
    message: mockMessage as any,
    args,
  });

  const { errorLogSpy } = t.context as any;
  t.true(errorLogSpy.calledWith(e));
});
