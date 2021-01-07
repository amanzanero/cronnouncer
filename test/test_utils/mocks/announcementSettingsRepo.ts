import { GuildID } from "../../../src/core/announcement/domain/announcement";
import { IAnnouncementSettingsRepo } from "../../../src/core/announcement/repos";
import { AnnouncementSettings } from "../../../src/core/announcement/domain/announcementSettings";

/**
 * Using in-memory for testing
 */
interface Datastore {
  [id: string]: AnnouncementSettings | undefined;
}

export class MockAnnouncementSettingsRepo implements IAnnouncementSettingsRepo {
  private readonly datastore: Datastore;

  constructor() {
    this.datastore = {};
  }

  public async getByGuildID(guildID: GuildID): Promise<AnnouncementSettings | undefined> {
    return this.datastore[guildID.value];
  }

  public async save(announcementSettings: AnnouncementSettings) {
    const existing = this.datastore[announcementSettings.guildID.value];
    if (!existing) {
      this.datastore[announcementSettings.guildID.value] = announcementSettings;
    } else {
      this.datastore[announcementSettings.guildID.value] = existing.copy({
        timezone: announcementSettings.timezone,
      });
    }
  }
}
