import test from "ava";
import sinon from "sinon";

import handleMessages from "../../../../src/handlers/message";
import * as messageHandlers from "../../../../src/handlers/message/message";
import { genTestMessage } from "../../../test_utils/mock";

test.afterEach(() => {
  sinon.restore();
});

test("handles ping command", async (t) => {
  const message = genTestMessage("!ping");
  sinon.spy(message.channel, "send");
  await t.notThrowsAsync(handleMessages(message));
  t.deepEqual(message.channel.send.getCall(0).args, ["pong!🏓"]);
});

test("does nothing with no command", async (t) => {
  const message = genTestMessage("no command");
  const mhStub = sinon.stub(messageHandlers);
  await t.notThrowsAsync(handleMessages(message));
  t.true(mhStub.handlePing.notCalled);
});
