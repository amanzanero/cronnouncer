import {
  AddAnnouncementIncrementCounterProps,
  IIdentifierService,
} from "../../../src/core/announcement/services/identifierService";
import { createMockAnnouncement } from "./announcement";
import { MockAnnouncementRepo } from "./announcementRepo";

export class MockIdentifierService implements IIdentifierService {
  announcementRepo: MockAnnouncementRepo;

  constructor(ar: MockAnnouncementRepo) {
    this.announcementRepo = ar;
  }

  async addAnnouncementIncrementCounter({
    guildID,
    guildSettings,
    userID,
  }: AddAnnouncementIncrementCounterProps) {
    const a = createMockAnnouncement({
      guildID,
      shortID: guildSettings.nextShortID,
      userID,
    });
    await this.announcementRepo.save(a);
    return a;
  }
}
