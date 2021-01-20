import {
  CronService,
  ICronService,
  ScheduleAnnouncementProps,
  UnScheduleAnnouncementProps,
} from "../../../src/core/announcement/services/cron";

export class MockCronService implements ICronService {
  emptyCronService: CronService;

  constructor() {
    this.emptyCronService = new CronService({} as any);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async unScheduleAnnouncement(_: UnScheduleAnnouncementProps): Promise<void> {
    return;
  }

  async scheduleAnnouncement(_: ScheduleAnnouncementProps) {
    return;
  }
}
