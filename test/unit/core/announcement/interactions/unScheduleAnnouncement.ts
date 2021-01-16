import test from "ava";
import moment from "moment";
import { unScheduleAnnouncement } from "../../../../../src/core/announcement/interactions/unScheduleAnnouncement";
import { Response } from "../../../../../src/lib";
import { createMockAnnouncement } from "../../../../test_utils/mocks/announcement";
import {
  AnnouncementLockedStatusError,
  AnnouncementNotFoundError,
  ValidationError,
} from "../../../../../src/core/announcement/errors";
import { MockAnnouncementRepo } from "../../../../test_utils/mocks/announcementRepo";
import { MockLoggerService } from "../../../../test_utils/mocks/loggerService";
import {
  AnnouncementStatus,
  Status,
} from "../../../../../src/core/announcement/domain/announcement/Status";

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

test("should not unschedule with undefined inputs", async (t) => {
  const { deps } = t.context as TestContext;

  const input: any = { guildID: "A guild" };
  const response = await unScheduleAnnouncement(input, deps as any);

  const expectedErr = new ValidationError("No announcement id was provided.");
  t.deepEqual(response.value, expectedErr);
});

test("should not unschedule if no announcement in progress", async (t) => {
  const { deps } = t.context as TestContext;

  const guildID = "1";
  const input = { guildID, announcementID: "dne" };
  const response = await unScheduleAnnouncement(input, deps as any);

  const expectedErr = new AnnouncementNotFoundError("dne");
  t.deepEqual(response.value, expectedErr);
});

test("should not unschedule if an announcement is sent", async (t) => {
  const { deps } = t.context as TestContext;

  const guildID = "3";

  const announcement = createMockAnnouncement({
    channel: "some-channel",
    guildID,
    message: "A message!",
    scheduledTime: moment(),
    status: AnnouncementStatus.sent,
  });
  await deps.announcementRepo.save(announcement);

  const input = { guildID, announcementID: announcement.id.value };
  const response = await unScheduleAnnouncement(input, deps as any);

  const expectedErr = new AnnouncementLockedStatusError(announcement.id.value);
  t.deepEqual(response.value, expectedErr);
});

test("should unschedule", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo } = deps;

  const guildID = "2";

  const announcement = createMockAnnouncement({
    channel: "some-channel",
    guildID,
    message: "A message!",
    scheduledTime: moment().add(1, "day"),
    status: AnnouncementStatus.scheduled,
  });
  await announcementRepo.save(announcement);

  const input = { announcementID: announcement.id.value, guildID };
  const response = await unScheduleAnnouncement(input, deps as any);

  const expected = Response.success<void>();
  const deleted = await announcementRepo.findByID(announcement.id.value);
  t.deepEqual(response, expected);

  const status = Status.create(AnnouncementStatus.unscheduled).getValue();
  t.deepEqual(deleted, announcement.copy({ status }));
});
