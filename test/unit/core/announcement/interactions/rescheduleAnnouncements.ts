import test from "ava";
import moment from "moment";
import sinon from "sinon";
import { createMockAnnouncement } from "../../../../test_utils/mocks/announcement";
import { MockAnnouncementRepo } from "../../../../test_utils/mocks/announcementRepo";
import { MockCronService } from "../../../../test_utils/mocks/cronService";
import { MockGuildSettingsRepo } from "../../../../test_utils/mocks/guildSettingsRepo";
import { TimeService } from "../../../../../src/core/announcement/services/time";
import { createMockGuildSettings } from "../../../../test_utils/mocks/guildSettings";
import { MockLoggerService } from "../../../../test_utils/mocks/loggerService";
import { rescheduleAnnouncements } from "../../../../../src/core/announcement/interactions/rescheduleAnnoucements";
import { AnnouncementStatus } from "../../../../../src/core/announcement/domain/announcement/Status";

interface TestContext {
  deps: {
    announcementRepo: MockAnnouncementRepo;
    guildSettingsRepo: MockGuildSettingsRepo;
    cronService: MockCronService;
    timeService: TimeService;
  };
}

test.before(async (t) => {
  const announcementRepo = new MockAnnouncementRepo();
  const guildSettingsRepo = new MockGuildSettingsRepo();
  const cronService = new MockCronService();
  const timeService = new TimeService();

  Object.assign(t.context, {
    deps: {
      announcementRepo,
      guildSettingsRepo,
      cronService,
      timeService,
    },
  });
  await guildSettingsRepo.save(
    createMockGuildSettings({
      timezone: "US/Pacific",
      guildID: "guildWithSettings0",
    }),
  );
  await guildSettingsRepo.save(
    createMockGuildSettings({
      timezone: "US/Pacific",
      guildID: "guildWithSettings1",
    }),
  );
});

test.afterEach((t) => {
  const {
    deps: { announcementRepo },
  } = t.context as TestContext;
  announcementRepo.datastore = {};
});

test.serial("should log none were rescheduled", async (t) => {
  const { deps } = t.context as TestContext;

  const loggerService = new MockLoggerService();
  const logSpy = sinon.spy(loggerService, "info");

  await rescheduleAnnouncements({ ...deps, loggerService } as any);
  t.true(logSpy.calledWith("rescheduleAnnouncements", "no announcements to reschedule"));
});

test.serial("should reschedule", async (t) => {
  const { deps } = t.context as TestContext;

  const loggerService = new MockLoggerService();
  const logSpy = sinon.spy(loggerService, "info");

  const promises: Promise<any>[] = [];
  const announcements: string[] = [];
  for (let i = 0; i < 10; i++) {
    const announcement = createMockAnnouncement({
      guildID: "guildWithSettings" + (i % 2),
      scheduledTime: moment().add(2, "days"),
      status: AnnouncementStatus.scheduled,
    });
    announcements.push(announcement.id.value);
    promises.push(deps.announcementRepo.save(announcement));
  }
  await Promise.all(promises);

  await rescheduleAnnouncements({ ...deps, loggerService } as any);
  t.true(logSpy.calledWith("rescheduleAnnouncements", `successfully scheduled 10 announcements`));
});

test.serial("should handle cron error", async (t) => {
  const { deps } = t.context as TestContext;

  const loggerService = new MockLoggerService();
  const cronService = new MockCronService();
  const logSpy = sinon.spy(loggerService, "error");
  const stub = sinon.stub(cronService, "scheduleAnnouncement");

  const announcement = createMockAnnouncement({
    status: AnnouncementStatus.scheduled,
    guildID: "guildWithSettings0",
    scheduledTime: moment().add(2, "days"),
  });

  stub
    .withArgs({
      announcement,
      loggerService: sinon.match.any,
      scheduledTimeUTC: sinon.match.any,
      announcementRepo: sinon.match.any,
    })
    .throws(new Error("Random cron error"));

  await deps.announcementRepo.save(announcement);

  await rescheduleAnnouncements({ ...deps, loggerService, cronService } as any);

  t.true(logSpy.calledWithMatch(`failed to schedule 1 announcements`, sinon.match.any));
});
