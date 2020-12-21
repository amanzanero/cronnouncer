/**
 * his file contains a repository composer for announcements
 */

import { GuildId } from "../domain/guildId";
import { Announcement } from "../domain/announcement";

export interface IAnnouncementRepo {
  findWorkInProgressByGuildId(guildID: GuildId): Promise<Announcement | undefined>;

  save(announcement: Announcement): Promise<void>;
}

/**
 * Using in-memory for now
 */
interface Datastore {
  [id: string]: Announcement[] | undefined;
}

export class AnnouncementRepo implements IAnnouncementRepo {
  private readonly datastore: Datastore;

  constructor() {
    this.datastore = {};
  }

  public async findWorkInProgressByGuildId(guildID: GuildId): Promise<Announcement | undefined> {
    const records = this.datastore[guildID.value];
    if (!records) return;

    const filtered = records.filter((curr) => !curr.published);
    return filtered.shift();
  }

  public async save(announcement: Announcement) {
    const records = this.datastore[announcement.guildId.value];
    const announcementList = records ? records : [];

    const existing = announcementList
      .filter((ann) => ann.id.value === announcement.id.value)
      .shift();

    if (existing) {
      this.datastore[announcement.guildId.value] = announcementList.reduce((acc, curr) => {
        if (curr.id.value === announcement.id.value) {
          acc.push(announcement);
        } else {
          acc.push(curr);
        }
        return acc;
      }, [] as Announcement[]);
    } else {
      announcementList.push(announcement);
      this.datastore[announcement.guildId.value] = announcementList;
    }
  }
}
