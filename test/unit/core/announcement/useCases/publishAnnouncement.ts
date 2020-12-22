import test from "ava";
import moment from "moment";
import {
  createPublishAnnouncementUseCase,
  OutputData,
  InputData,
  AnnouncementToOutput,
} from "../../../../../src/core/announcement/useCases/publishAnnouncement";
import {
  AnnouncementRepo,
  IAnnouncementRepo,
} from "../../../../../src/core/announcement/repos/announcementRepo";
import { Response, UseCaseExecute } from "../../../../../src/lib";
import { createMockAnnouncement } from "../../mocks/mockAnnouncement";
import {
  AnnouncementError,
  AnnouncementIncompleteError,
  AnnouncementNotInProgressError,
  ValidationError,
} from "../../../../../src/core/announcement/errors";

interface TestContext {
  repo: IAnnouncementRepo;
  useCase: UseCaseExecute<InputData, OutputData | AnnouncementError>;
}

test.before((t) => {
  const repo = new AnnouncementRepo(); // using actual repo since it's in memory
  const useCase = createPublishAnnouncementUseCase(repo);
  Object.assign(t.context, { repo, useCase });
});

test("should fail with undefined input", async (t) => {
  const { useCase } = t.context as TestContext;

  const response = await useCase({
    guildID: undefined,
  } as any);

  const expectedErr = new ValidationError("guildID is null or undefined");
  t.deepEqual(response.value, expectedErr);
});

test("should fail if there is no announcement in progress", async (t) => {
  const { useCase } = t.context as TestContext;

  const guildID = "1";
  const response = await useCase({
    guildID,
  });

  const expectedErr = new AnnouncementNotInProgressError(guildID);
  t.deepEqual(response.value, expectedErr);
});

test("should fail if announcement in progress is not complete", async (t) => {
  const { useCase, repo } = t.context as TestContext;
  const guildID = "1";

  const announcement = createMockAnnouncement({ guildID });
  await repo.save(announcement);
  const response = await useCase({
    guildID,
  });

  const expectedErr = new AnnouncementIncompleteError();
  t.deepEqual(response.value, expectedErr);
});

test("should pass if announcement in progress is completed", async (t) => {
  const { useCase, repo } = t.context as TestContext;
  const guildID = "2";

  const announcement = createMockAnnouncement({
    channel: "some-channel",
    guildID,
    message: "A message!",
    scheduledTime: moment().add(1, "day"),
  });
  await repo.save(announcement);
  const response = await useCase({
    guildID,
  });

  const expected = Response.success<OutputData>(AnnouncementToOutput(announcement));
  t.deepEqual(response, expected);
});
