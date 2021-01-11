import { Announcement, GuildID } from "../../../src/core/announcement/domain/announcement";
import { IAnnouncementRepo } from "../../../src/core/announcement/repos";
import { AnnouncementStatus } from "../../../src/core/announcement/domain/announcement/Status";

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

    const filtered = records.filter((curr) => curr.status.value === AnnouncementStatus.active);
    return filtered.shift();
  }

  async findScheduled(): Promise<Announcement[]> {
    return [] as Announcement[];
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
