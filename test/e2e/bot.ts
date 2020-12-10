import test from "ava";
import sinon from "sinon";

import { main } from "../../src/bot";
import { timeout } from "../test_utils/time";

test.before((t) => {
  const exitStub = sinon.stub(process, "exit");
  Object.assign(t.context, { exitStub });
});

test.after(() => {
  sinon.restore();
});

test.afterEach(() => {
  sinon.reset();
  process.removeAllListeners("SIGTERM");
});

test.serial("Discord client starts ok", async (t) => {
  await t.notThrowsAsync(main);
  await timeout(1000, () => undefined);
  process.kill(process.pid, "SIGTERM");
  await timeout(1000, () => undefined);
});

test.serial(`should call 'process.exit(0))' when receiving a  SIGTERM`, async (t) => {
  const { exitStub } = t.context as any;
  await t.notThrowsAsync(main);
  await timeout(1000, () => undefined);
  process.kill(process.pid, "SIGTERM");
  await timeout(1000, () => {
    t.true(exitStub.calledWith(0));
  });
});
