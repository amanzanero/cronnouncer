import test from "ava";
import sinon from "sinon";

import { handlePing, makeLogInfo } from "../../../src/handlers/message/message";
import { logger } from "../../../src/services";
import { genTestMessage } from "../../test_utils/mock";

test.beforeEach((t) => {
  Object.assign(t.context, {
    message: genTestMessage(),
  });
});

test("sends pong", async (t) => {
  const { message } = t.context as any;
  sinon.spy(message.channel, "send");
  await t.notThrowsAsync(handlePing(message));
  t.deepEqual(message.channel.send.getCall(0).args, ["pong!🏓"]);
});

test("throws err and logs", async (t) => {
  const { message } = t.context as any;
  const e = new Error("ava err");
  sinon.stub(message.channel, "send").throws(e);
  sinon.spy(logger, "error");
  await t.notThrowsAsync(handlePing(message));
  t.deepEqual((logger as any).error.getCall(0).args, [
    `${makeLogInfo(message.author.id)} ${e.stack}`,
  ]);
});
