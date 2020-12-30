import test from "ava";
import moment from "moment";
import {
  makeCancelAnnouncement,
  InputData,
} from "../../../../../src/core/announcement/interactions/cancelAnnouncement";

import { Response, InteractionExecute } from "../../../../../src/lib";
import { createMockAnnouncement } from "../../../../test_utils/mocks/mockAnnouncement";
import {
  AnnouncementError,
  AnnouncementNotInProgressError,
  ValidationError,
} from "../../../../../src/core/announcement/errors";
import { MockAnnouncementRepo } from "../../../../test_utils/mocks/announcementRepo";

interface TestContext {
  repo: MockAnnouncementRepo;
  interactionExecutor: InteractionExecute<InputData, void | AnnouncementError>;
}

test.before((t) => {
  const repo = new MockAnnouncementRepo(); // using actual repo since it's in memory
  const interactionExecutor = makeCancelAnnouncement(repo);
  Object.assign(t.context, { repo, interactionExecutor });
});

test("should not delete with undefined inputs", async (t) => {
  const { interactionExecutor } = t.context as TestContext;

  const response = await interactionExecutor({
    guildID: undefined,
  } as any);

  const expectedErr = new ValidationError("guildID is null or undefined");
  t.deepEqual(response.value, expectedErr);
});

test("should not delete if no announcement in progress", async (t) => {
  const { interactionExecutor } = t.context as TestContext;

  const guildID = "1";
  const response = await interactionExecutor({
    guildID,
  });

  const expectedErr = new AnnouncementNotInProgressError(guildID);
  t.deepEqual(response.value, expectedErr);
});

test("should delete", async (t) => {
  const { interactionExecutor, repo } = t.context as TestContext;
  const guildID = "2";

  const announcement = createMockAnnouncement({
    channel: "some-channel",
    guildID,
    message: "A message!",
    scheduledTime: moment().add(1, "day"),
  });
  await repo.save(announcement);
  const response = await interactionExecutor({
    guildID,
  });

  const expected = Response.success<void>();
  const deleted = await repo.findWorkInProgressByGuildID(announcement.guildID);
  t.deepEqual(response, expected);
  t.is(deleted, undefined);
});
