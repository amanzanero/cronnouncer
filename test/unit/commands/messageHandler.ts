import test from "ava";
import sinon from "sinon";

import {
  generateCommands,
  UNKNOWN_COMMAND_RESPONSE,
  useMessageHandler,
} from "../../../src/commands";
import { genTestMessage } from "../../test_utils/mock";
import * as parser from "../../../src/lib/parser";
import { logger } from "../../../src/services";

test.before((t) => {
  const commands = generateCommands();
  // stub our executions
  Object.entries(commands).forEach((keyValue) => {
    if (!keyValue[1]) return;
    sinon.stub(keyValue[1], "execute");
  });
  const errorLogSpy = sinon.spy(logger, "error");
  const messageHandler = useMessageHandler({} as any, commands);
  Object.assign(t.context, { commands, messageHandler, errorLogSpy });
});

test.afterEach(() => {
  sinon.reset();
});

test.serial("ignores bot", async (t) => {
  const { messageHandler, commands } = t.context as any;
  const message = genTestMessage({ bot: true, message: "!ping" });
  await messageHandler(message);
  t.true(commands.ping.execute.notCalled);
});

test("ignores non-command message", async (t) => {
  const { messageHandler } = t.context as any;
  const parseSpy = sinon.spy(parser, "isCommand");
  const message = genTestMessage({ message: "sup dawg" });
  await messageHandler(message);
  t.true(parseSpy.returned(false));
});

test("handles unknown command with reply", async (t) => {
  const { messageHandler } = t.context as any;
  const message = genTestMessage({ message: "!unknown" });
  const sendStub = sinon.stub(message.channel, "send");
  await messageHandler(message);
  t.true(sendStub.calledOnceWith(UNKNOWN_COMMAND_RESPONSE));
});

test("handles unknown command with reply - throws gracefully", async (t) => {
  const { messageHandler, errorLogSpy } = t.context as any;
  const message = genTestMessage({ message: "!unknown" });
  const err = new Error("Send unsuccessful");
  sinon.stub(message.channel, "send").throws(err);

  await messageHandler(message);
  t.true(errorLogSpy.calledOnceWith(err.stack));
});

test.serial("executes a command", async (t) => {
  const { messageHandler, commands } = t.context as any;
  const message = genTestMessage({ message: "!ping" });

  await messageHandler(message);
  t.true(commands.ping.execute.called);
});

test.serial("executes a command unsuccessfully", async (t) => {
  const { messageHandler, commands } = t.context as any;
  const message = genTestMessage({ message: "!ping" });
  const err = new Error("Execute unsuccessful");
  commands.ping.execute.throws(err);

  await messageHandler(message);
  t.true(commands.ping.execute.called);
});
