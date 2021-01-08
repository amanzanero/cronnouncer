import {
  CronService,
  ICronService,
  ScheduleAnnouncementProps,
} from "../../../src/core/announcement/services/cron";

export class MockCronService implements ICronService {
  emptyCronService: CronService;

  constructor() {
    this.emptyCronService = new CronService({} as any);
  }

  async scheduleAnnouncement(_: ScheduleAnnouncementProps): Promise<void> {
    return;
  }
}
