import test from "ava";
import sinon from "sinon";

import { main } from "../../src/bot";
import { timeout } from "../test_utils/time";
import * as db from "../../src/infra/typeorm";

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

test.serial("discord client starts and shuts down gracefully", async (t) => {
  const { exitStub } = t.context as any;
  await t.notThrowsAsync(main);
  process.kill(process.pid, "SIGTERM");
  await timeout(1000, () => undefined);
  t.true(exitStub.calledWith(0));
});

test.serial("discord client starts and has shutdown error", async (t) => {
  const { exitStub } = t.context as any;
  sinon.stub(db, "initDB").resolves({
    stores: { announcementStore: {} },
    storesDisconnect: async () => {
      throw new Error("some error");
    },
  } as any);
  await t.notThrowsAsync(main);
  process.kill(process.pid, "SIGTERM");
  await timeout(1000, () => undefined);
  t.true(exitStub.calledWith(0));
});
