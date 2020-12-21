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

interface TestContext {
  repo: IAnnouncementRepo;
  useCase: UseCaseExecute<InputData, OutputData>;
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

  t.deepEqual(Response.fail<OutputData>("guildId is null or undefined"), response);
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

  t.deepEqual(
    Response.fail<OutputData>("There is an unfinished announcement for this guild."),
    response,
  );
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
