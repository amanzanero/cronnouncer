import test from "ava";
import moment from "moment";
import { deleteAnnouncement } from "../../../../../src/core/announcement/interactions/deleteAnnouncement";
import { Response } from "../../../../../src/lib";
import { createMockAnnouncement } from "../../../../test_utils/mocks/announcement";
import {
  AnnouncementNotFoundError,
  ValidationError,
} from "../../../../../src/core/announcement/errors";
import { MockAnnouncementRepo } from "../../../../test_utils/mocks/announcementRepo";
import { MockLoggerService } from "../../../../test_utils/mocks/loggerService";
import { AnnouncementStatus } from "../../../../../src/core/announcement/domain/announcement/Status";

interface TestContext {
  deps: {
    announcementRepo: MockAnnouncementRepo;
    loggerService: MockLoggerService;
  };
}

test.before((t) => {
  const announcementRepo = new MockAnnouncementRepo();
  const loggerService = new MockLoggerService();
  Object.assign(t.context, { deps: { announcementRepo, loggerService } });
});

test("should not delete with no announcementID", async (t) => {
  const { deps } = t.context as TestContext;
  const ann = createMockAnnouncement({});
  await deps.announcementRepo.save(ann);

  const input = { announcementID: "" };
  const response = await deleteAnnouncement(input, deps as any);

  const expectedErr = new ValidationError("No announcement id was provided.");
  t.deepEqual(response.value, expectedErr);

  // should still be persisted
  t.deepEqual(await deps.announcementRepo.findByID(ann.id.value), ann);
});

test("should not delete if no announcement", async (t) => {
  const { deps } = t.context as TestContext;
  const ann = createMockAnnouncement({});
  await deps.announcementRepo.save(ann);

  const guildID = "1";
  const input = { guildID, announcementID: "dne" };
  const response = await deleteAnnouncement(input, deps as any);

  const expectedErr = new AnnouncementNotFoundError("dne");
  t.deepEqual(response.value, expectedErr);

  // should still be persisted
  t.deepEqual(await deps.announcementRepo.findByID(ann.id.value), ann);
});

test("should delete", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo } = deps;

  const guildID = "2";

  const announcement = createMockAnnouncement({
    channelID: "some-channel",
    guildID,
    message: "A message!",
    scheduledTime: moment().add(1, "day"),
    status: AnnouncementStatus.scheduled,
  });
  await announcementRepo.save(announcement);

  const input = { announcementID: announcement.id.value, guildID };
  const response = await deleteAnnouncement(input, deps as any);

  const expected = Response.success<void>();
  const deleted = await announcementRepo.findByID(announcement.id.value);
  t.deepEqual(response, expected);

  t.is(deleted, undefined);
});
