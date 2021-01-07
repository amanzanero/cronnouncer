import {
  ICronService,
  ScheduleAnnouncementProps,
} from "../../../src/core/announcement/services/cron";

export class MockCronService implements ICronService {
  async scheduleAnnouncement(_: ScheduleAnnouncementProps): Promise<void> {
    return;
  }
}
