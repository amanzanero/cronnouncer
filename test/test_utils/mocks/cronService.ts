import {
  ICronService,
  ScheduleAnnouncementProps,
  UnScheduleAnnouncementProps,
} from "../../../src/core/announcement/services/cron";

export class MockCronService implements ICronService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unScheduleAnnouncement(_: UnScheduleAnnouncementProps) {
    return;
  }

  async scheduleAnnouncement(_: ScheduleAnnouncementProps) {
    return;
  }
}
