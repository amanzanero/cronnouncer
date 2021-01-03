import { Announcement, GuildID } from "../../../src/core/announcement/domain";
import { IAnnouncementRepo } from "../../../src/core/announcement/repos";

/**
 * Using in-memory for testing
 */
interface Datastore {
  [id: string]: Announcement[] | undefined;
}

export class MockAnnouncementRepo implements IAnnouncementRepo {
  private readonly datastore: Datastore;

  constructor() {
    this.datastore = {};
  }

  public async findWorkInProgressByGuildID(guildID: GuildID): Promise<Announcement | undefined> {
    const records = this.datastore[guildID.value];
    if (!records) return;

    const filtered = records.filter((curr) => !curr.published);
    return filtered.shift();
  }

  public async save(announcement: Announcement) {
    const records = this.datastore[announcement.guildID.value];
    const announcementList = records ? records : [];

    const existing = announcementList
      .filter((ann) => ann.id.value === announcement.id.value)
      .shift();

    if (existing) {
      this.datastore[announcement.guildID.value] = announcementList.reduce((acc, curr) => {
        if (curr.id.value === announcement.id.value) {
          acc.push(announcement);
        } else {
          acc.push(curr);
        }
        return acc;
      }, [] as Announcement[]);
    } else {
      announcementList.push(announcement);
      this.datastore[announcement.guildID.value] = announcementList;
    }
  }

  async delete(announcement: Announcement): Promise<void> {
    const records = this.datastore[announcement.guildID.value];
    const announcementList = records ? records : [];

    this.datastore[announcement.guildID.value] = announcementList.filter(
      (stored) => stored.id.value !== announcement.id.value,
    );
  }
}
