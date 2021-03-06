import test, { before } from "ava";
import moment from "moment";
import sinon from "sinon";
import { unScheduleAnnouncement } from "../../../../../src/core/announcement/interactions/unScheduleAnnouncement";
import { Response } from "../../../../../src/core/lib";
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
import { MockCronService } from "../../../../test_utils/mocks/cronService";

interface TestContext {
  deps: {
    announcementRepo: MockAnnouncementRepo;
    loggerService: MockLoggerService;
  };
}

before((t) => {
  const announcementRepo = new MockAnnouncementRepo();
  const loggerService = new MockLoggerService();
  Object.assign(t.context, { deps: { announcementRepo, loggerService, meta: {} } });
});

test("should not unschedule with undefined inputs", async (t) => {
  const { deps } = t.context as TestContext;
  const cronService = new MockCronService();
  const cronStub = sinon.stub(cronService, "unScheduleAnnouncement");

  const input: any = { guildID: "A guild" };
  const response = await unScheduleAnnouncement(input, { ...deps, cronService } as any);

  const expectedErr = new ValidationError("No announcementID was provided");
  t.deepEqual(response.value, expectedErr);
  t.true(cronStub.notCalled);
});

test("should not unschedule if no announcement in progress", async (t) => {
  const { deps } = t.context as TestContext;
  const cronService = new MockCronService();
  const cronStub = sinon.stub(cronService, "unScheduleAnnouncement");

  const guildID = "1";
  const input = { guildID, announcementID: -1 };
  const response = await unScheduleAnnouncement(input, { ...deps, cronService } as any);

  const expectedErr = new AnnouncementNotFoundError("-1");
  t.deepEqual(response.value, expectedErr);
  t.true(cronStub.notCalled);
});

test("should not unschedule if an announcement is sent", async (t) => {
  const { deps } = t.context as TestContext;
  const cronService = new MockCronService();
  const cronStub = sinon.stub(cronService, "unScheduleAnnouncement");

  const guildID = "3";

  const announcement = createMockAnnouncement({
    channelID: "some-channel",
    guildID,
    message: "A message!",
    scheduledTime: moment(),
    status: AnnouncementStatus.sent,
  });
  await deps.announcementRepo.save(announcement);

  const input = { guildID, announcementID: announcement.shortID };
  const response = await unScheduleAnnouncement(input, { ...deps, cronService } as any);

  const expectedErr = new AnnouncementLockedStatusError(announcement.shortID.toString());
  t.deepEqual(response.value, expectedErr);
  t.true(cronStub.notCalled);
});

test("should unschedule", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo } = deps;
  const cronService = new MockCronService();
  const cronStub = sinon.stub(cronService, "unScheduleAnnouncement");

  const guildID = "2";

  const announcement = createMockAnnouncement({
    channelID: "some-channel",
    guildID,
    message: "A message!",
    scheduledTime: moment().add(1, "day"),
    status: AnnouncementStatus.scheduled,
  });
  await announcementRepo.save(announcement);

  const input = { announcementID: announcement.shortID, guildID };
  const response = await unScheduleAnnouncement(input, { ...deps, cronService } as any);

  const expected = Response.success<void>();
  const deleted = await announcementRepo.findByID(announcement.id.value);
  t.deepEqual(response, expected);

  const status = Status.create(AnnouncementStatus.unscheduled).getValue();
  t.deepEqual(deleted, announcement.copy({ status }));
  t.true(
    cronStub.calledWith({
      announcement,
      requestID: sinon.match.any,
      loggerService: deps.loggerService,
    }),
  );
});
