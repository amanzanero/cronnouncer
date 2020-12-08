import test from "ava";
import sinon from "sinon";
import { handlePing, makeLogInfo } from "../../../src/handlers/message/message";
import { logger } from "../../../src/services";

test.before((t) => {
  Object.assign(t.context, {
    message: {
      author: { id: "ava" },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      channel: { send: async (_: string) => undefined },
    },
    messageThrows: {
      author: { id: "ava" },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      channel: { send: async (_: string) => undefined },
    },
  });
});

test("sends pong", async (t) => {
  const { message } = t.context as any;
  sinon.spy(message.channel, "send");
  await t.notThrowsAsync(handlePing(message));
  t.deepEqual(message.channel.send.getCall(0).args, ["pong!🏓"]);
});

test("throws err and logs", async (t) => {
  const { messageThrows } = t.context as any;
  const e = new Error("ava err");
  sinon.stub(messageThrows.channel, "send").throws(e);
  sinon.spy(logger, "error");
  await t.notThrowsAsync(handlePing(messageThrows));
  t.deepEqual((logger as any).error.getCall(0).args, [
    `${makeLogInfo(messageThrows.author.id)} ${e.stack}`,
  ]);
});
