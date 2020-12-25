import test from "ava";
import moment from "moment";
import {
  makePublishAnnouncement,
  InputData,
} from "../../../../../src/core/announcement/interactions/publishAnnouncement";
import {
  AnnouncementRepo,
  IAnnouncementRepo,
} from "../../../../../src/core/announcement/repos/AnnouncementRepo";
import { Response, InteractionExecute } from "../../../../../src/lib";
import { createMockAnnouncement } from "../../../../test_utils/mocks/mockAnnouncement";
import {
  AnnouncementError,
  AnnouncementIncompleteError,
  AnnouncementNotInProgressError,
  ValidationError,
} from "../../../../../src/core/announcement/errors";
import {
  AnnouncementOutput,
  AnnouncementToOutput,
} from "../../../../../src/core/announcement/interactions/common";

interface TestContext {
  repo: IAnnouncementRepo;
  interactionExecutor: InteractionExecute<InputData, AnnouncementOutput | AnnouncementError>;
}

test.before((t) => {
  const repo = new AnnouncementRepo(); // using actual repo since it's in memory
  const interactionExecutor = makePublishAnnouncement(repo);
  Object.assign(t.context, { repo, interactionExecutor });
});

test("should fail with undefined input", async (t) => {
  const { interactionExecutor } = t.context as TestContext;

  const response = await interactionExecutor({
    guildID: undefined,
  } as any);

  const expectedErr = new ValidationError("guildID is null or undefined");
  t.deepEqual(response.value, expectedErr);
});

test("should fail if there is no announcement in progress", async (t) => {
  const { interactionExecutor } = t.context as TestContext;

  const guildID = "1";
  const response = await interactionExecutor({
    guildID,
  });

  const expectedErr = new AnnouncementNotInProgressError(guildID);
  t.deepEqual(response.value, expectedErr);
});

test("should fail if announcement in progress is not complete", async (t) => {
  const { interactionExecutor, repo } = t.context as TestContext;
  const guildID = "1";

  const announcement = createMockAnnouncement({ guildID });
  await repo.save(announcement);
  const response = await interactionExecutor({
    guildID,
  });

  const expectedErr = new AnnouncementIncompleteError();
  t.deepEqual(response.value, expectedErr);
});

test("should pass if announcement in progress is completed", async (t) => {
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

  const expected = Response.success<AnnouncementOutput>(AnnouncementToOutput(announcement));
  t.deepEqual(response, expected);
});
