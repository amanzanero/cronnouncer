import test from "ava";
import {
  createStartAnnouncementUseCase,
  OutputData,
  InputData,
} from "../../../../../src/core/announcement/useCases/startAnnouncement";
import {
  AnnouncementRepo,
  IAnnouncementRepo,
} from "../../../../../src/core/announcement/repos/announcementRepo";
import { Response, UseCaseExecute } from "../../../../../src/lib";
import { createMockAnnouncement } from "../../mocks/mockAnnouncement";
import {
  AnnouncementInProgressError,
  ValidationError,
} from "../../../../../src/core/announcement/errors";

interface TestContext {
  repo: IAnnouncementRepo;
  useCase: UseCaseExecute<InputData, OutputData | Error>;
}

test.before((t) => {
  const repo = new AnnouncementRepo(); // using actual repo since it's in memory
  const useCase = createStartAnnouncementUseCase(repo);
  Object.assign(t.context, { repo, useCase });
});

test("should fail with undefined DTO field", async (t) => {
  const { useCase } = t.context as TestContext;

  const response = await useCase({
    senderId: 1,
    guildId: undefined,
  } as any);

  const expectedErr = new ValidationError("guildId is null or undefined");
  t.deepEqual(response.value, expectedErr);
});

test("should fail when an announcement is in progress for a guild", async (t) => {
  const { useCase, repo } = t.context as TestContext;

  const existingAnnouncement = createMockAnnouncement({
    guildId: "1",
  });
  await repo.save(existingAnnouncement);

  const response = await useCase({
    guildId: "1",
    senderId: existingAnnouncement.senderId.value,
  } as any);

  const expected = new AnnouncementInProgressError(existingAnnouncement.guildId.value);
  t.deepEqual(response.value, expected);
});

test("should successfully create", async (t) => {
  const { useCase } = t.context as TestContext;

  const response = await useCase({
    guildId: "2",
    senderId: "2",
  } as any);

  t.deepEqual(
    Response.success<OutputData>({ senderId: "2", guildId: "2", published: false }),
    response,
  );
});
