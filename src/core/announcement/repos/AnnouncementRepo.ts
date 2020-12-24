/**
 * his file contains a repository composer for announcements
 */

import { Announcement, GuildID } from "../domain";

export interface IAnnouncementRepo {
  findWorkInProgressByGuildId(guildID: GuildID): Promise<Announcement | undefined>;

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

  public async findWorkInProgressByGuildId(guildID: GuildID): Promise<Announcement | undefined> {
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
      this.datastore[1] = announcementList.reduce((acc, curr) => {
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
}
