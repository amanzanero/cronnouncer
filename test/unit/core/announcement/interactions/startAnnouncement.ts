import test from "ava";
import {
  makeStartAnnouncement,
  OutputData,
  InputData,
} from "../../../../../src/core/announcement/interactions/startAnnouncement";
import { Response, InteractionExecute } from "../../../../../src/lib";
import { createMockAnnouncement } from "../../../../test_utils/mocks/mockAnnouncement";
import {
  AnnouncementError,
  AnnouncementInProgressError,
  ValidationError,
} from "../../../../../src/core/announcement/errors";
import { MockAnnouncementRepo } from "../../../../test_utils/mocks/announcementRepo";

interface TestContext {
  repo: MockAnnouncementRepo;
  interactionExecutor: InteractionExecute<InputData, OutputData | AnnouncementError>;
}

test.before((t) => {
  const repo = new MockAnnouncementRepo(); // using actual repo since it's in memory
  const interactionExecutor = makeStartAnnouncement(repo);
  Object.assign(t.context, { repo, interactionExecutor });
});

test("should fail with undefined DTO field", async (t) => {
  const { interactionExecutor } = t.context as TestContext;

  const response = await interactionExecutor({
    guildID: undefined,
  } as any);

  const expectedErr = new ValidationError("guildID is null or undefined");
  t.deepEqual(response.value, expectedErr);
});

test("should fail when an announcement is in progress for a guild", async (t) => {
  const { interactionExecutor, repo } = t.context as TestContext;

  const existingAnnouncement = createMockAnnouncement({
    guildID: "1",
  });
  await repo.save(existingAnnouncement);

  const response = await interactionExecutor({
    guildID: "1",
  } as any);

  const expected = new AnnouncementInProgressError(existingAnnouncement.guildID.value);
  t.deepEqual(response.value, expected);
});

test("should successfully create", async (t) => {
  const { interactionExecutor } = t.context as TestContext;

  const response = await interactionExecutor({
    guildID: "2",
  } as any);

  t.deepEqual(
    Response.success<OutputData>({ guildID: "2", published: false }),
    response,
  );
});
