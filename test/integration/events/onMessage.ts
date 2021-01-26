import test, { after, afterEach, before, serial } from "ava";
import sinon from "sinon";

import { makeMessageHandler } from "../../../src/events";
import * as cmd from "../../../src/commands";
import { genTestMessage } from "../../test_utils/mocks/discordMessage";
import * as parser from "../../../src/commands/util/parser";
import { logger } from "../../../src/infra/logger";
import { PREFIX } from "../../../src/constants";
import { initDB } from "../../../src/infra/typeorm";

before(async (t) => {
  const deps: any = { stores: {}, discordClient: {} };
  const { storesDisconnect: closeConnection } = await initDB();

  const commands = cmd.makeCommandMap(deps);
  // stub our executions
  commands.forEach((command) => {
    sinon.stub(command, "execute");
  });

  sinon.stub(cmd, "makeCommandMap").returns(commands);
  const errorLogSpy = sinon.spy(logger, "error");
  const messageHandler = makeMessageHandler(deps);
  Object.assign(t.context, { commands, messageHandler, errorLogSpy, closeConnection });
});

afterEach(() => {
  sinon.reset();
});

after(async (t) => {
  await (t.context as any).closeConnection();
});

serial("ignores bot", async (t) => {
  const { messageHandler, commands } = t.context as any;
  const message = genTestMessage({ bot: true, message: `${PREFIX}help` });
  await messageHandler(message);
  t.true(commands.get("help").execute.notCalled);
});

test("ignores non-command message", async (t) => {
  const { messageHandler } = t.context as any;
  const parseSpy = sinon.spy(parser, "isCommand");
  const message = genTestMessage({ message: "sup dawg" });
  await messageHandler(message);
  t.true(parseSpy.returned(false));
});

test("ignores non announcer role message", async (t) => {
  const { messageHandler, commands } = t.context as any;
  const message = genTestMessage({ message: "sup dawg", announcer: false });
  await messageHandler(message);
  t.true(commands.get("help").execute.notCalled);
});

test("handles unknown command with reply", async (t) => {
  const { messageHandler } = t.context as any;
  const message = genTestMessage({ message: `${PREFIX}unknown` });
  const sendStub = sinon.stub(message.channel, "send");
  await messageHandler(message);
  t.true(sendStub.calledOnceWith(cmd.UNKNOWN_COMMAND_RESPONSE));
});

test("handles unknown command with reply - throws gracefully", async (t) => {
  const { messageHandler, errorLogSpy } = t.context as any;
  const message = genTestMessage({ message: `${PREFIX}unknown` });
  const err = new Error("Send unsuccessful");
  sinon.stub(message.channel, "send").throws(err);

  await messageHandler(message);
  t.true(errorLogSpy.calledOnceWith(err));
});

serial("executes a command", async (t) => {
  const { messageHandler, commands } = t.context as any;
  const message = genTestMessage({ message: `${PREFIX}help` });

  await messageHandler(message);
  t.true(commands.get("help").execute.called);
});

serial("executes a command unsuccessfully", async (t) => {
  const { messageHandler, commands } = t.context as any;
  const message = genTestMessage({ message: `${PREFIX}help` });
  const err = new Error("Execute unsuccessful");
  commands.get("help").execute.throws(err);

  await messageHandler(message);
  t.true(commands.get("help").execute.called);
});
