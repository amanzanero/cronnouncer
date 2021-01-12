import { Announcement } from "../../../src/core/announcement/domain/announcement";
import { CronService, ICronService } from "../../../src/core/announcement/services/cron";

export class MockCronService implements ICronService {
  emptyCronService: CronService;

  constructor() {
    this.emptyCronService = new CronService({} as any);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async scheduleAnnouncement(_: Announcement, __: string): Promise<void> {
    return;
  }
}
