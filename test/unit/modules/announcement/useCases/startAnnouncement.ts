import test from "ava";
import { createStartAnnouncementUseCase } from "../../../../../src/modules/announcement/useCases/startAnnouncement/useCase";
import {
  AnnouncementRepo,
  IAnnouncementRepo,
} from "../../../../../src/modules/announcement/repos/announcementRepo";
import { Response, UseCaseExecute } from "../../../../../src/lib";
import { OutputDTO } from "../../../../../src/modules/announcement/useCases/startAnnouncement/outputDTO";
import { InputDTO } from "../../../../../src/modules/announcement/useCases/startAnnouncement/inputDTO";
import { createMockAnnouncement } from "../../mocks/mockAnnouncement";

interface TestContext {
  repo: IAnnouncementRepo;
  useCase: UseCaseExecute<InputDTO, OutputDTO>;
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

  t.deepEqual(Response.fail<OutputDTO>("guildId is null or undefined"), response);
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
    Response.fail<OutputDTO>("There is an unfinished announcement for this guild."),
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
    Response.success<OutputDTO>({ senderId: "2", guildId: "2", published: false }),
    response,
  );
});
