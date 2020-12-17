import test from "ava";
import sinon from "sinon";

import ping from "../../../src/commands/ping";
import { logger } from "../../../src/services";
import { genTestMessage } from "../../test_utils/mock";

test.beforeEach((t) => {
  Object.assign(t.context, {
    message: genTestMessage(),
  });
});

test.afterEach(() => {
  sinon.reset();
});

test("sends pong", async (t) => {
  const { message } = t.context as any;
  sinon.spy(message.channel, "send");
  await t.notThrowsAsync(ping.execute({} as any, message));
  t.deepEqual(message.channel.send.getCall(0).args, ["pong!🏓"]);
});

test("throws err and logs", async (t) => {
  const { message } = t.context as any;
  const e = new Error("ava err");
  sinon.stub(message.channel, "send").throws(e);
  sinon.spy(logger, "error");
  await t.notThrowsAsync(ping.execute({} as any, message));
  const expectedArgs = (logger as any).error.getCall(0).args;
  t.deepEqual(expectedArgs, [e.stack]);
});
