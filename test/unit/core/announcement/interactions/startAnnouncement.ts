import test from "ava";
import {
  makeStartAnnouncement,
  OutputData,
  InputData,
} from "../../../../../src/core/announcement/interactions/startAnnouncement";
import {
  AnnouncementRepo,
  IAnnouncementRepo,
} from "../../../../../src/core/announcement/repos/AnnouncementRepo";
import { Response, UseCaseExecute } from "../../../../../src/lib";
import { createMockAnnouncement } from "../../mocks/mockAnnouncement";
import {
  AnnouncementError,
  AnnouncementInProgressError,
  ValidationError,
} from "../../../../../src/core/announcement/errors";

interface TestContext {
  repo: IAnnouncementRepo;
  useCase: UseCaseExecute<InputData, OutputData | AnnouncementError>;
}

test.before((t) => {
  const repo = new AnnouncementRepo(); // using actual repo since it's in memory
  const useCase = makeStartAnnouncement(repo);
  Object.assign(t.context, { repo, useCase });
});

test("should fail with undefined DTO field", async (t) => {
  const { useCase } = t.context as TestContext;

  const response = await useCase({
    guildID: undefined,
  } as any);

  const expectedErr = new ValidationError("guildID is null or undefined");
  t.deepEqual(response.value, expectedErr);
});

test("should fail when an announcement is in progress for a guild", async (t) => {
  const { useCase, repo } = t.context as TestContext;

  const existingAnnouncement = createMockAnnouncement({
    guildID: "1",
  });
  await repo.save(existingAnnouncement);

  const response = await useCase({
    guildID: "1",
  } as any);

  const expected = new AnnouncementInProgressError(existingAnnouncement.guildID.value);
  t.deepEqual(response.value, expected);
});

test("should successfully create", async (t) => {
  const { useCase } = t.context as TestContext;

  const response = await useCase({
    guildID: "2",
  } as any);

  t.deepEqual(
    Response.success<OutputData>({ guildID: "2", published: false }),
    response,
  );
});
