import { IIdentifierService } from "../../../src/core/announcement/services/identifierService";
import { GuildSettings } from "../../../src/core/announcement/domain/guildSettings";
import { createMockAnnouncement } from "./announcement";
import { MockAnnouncementRepo } from "./announcementRepo";

export class MockIdentifierService implements IIdentifierService {
  announcementRepo: MockAnnouncementRepo;

  constructor(ar: MockAnnouncementRepo) {
    this.announcementRepo = ar;
  }

  async addAnnouncementIncrementCounter(guildID: string, guildSettings: GuildSettings) {
    const a = createMockAnnouncement({
      guildID,
      shortID: guildSettings.nextShortID,
    });
    await this.announcementRepo.save(a);
    return a;
  }
}
