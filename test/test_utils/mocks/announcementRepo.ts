import { Announcement } from "../../../src/core/announcement/domain/announcement";
import { IAnnouncementRepo } from "../../../src/core/announcement/repos";
import { AnnouncementStatus } from "../../../src/core/announcement/domain/announcement/Status";

/**
 * Using in-memory for testing
 */
interface Datastore {
  [id: string]: Announcement | undefined;
}

export class MockAnnouncementRepo implements IAnnouncementRepo {
  datastore: Datastore;

  constructor() {
    this.datastore = {};
  }

  async findByID(announcementID: string): Promise<Announcement | undefined> {
    return this.datastore[announcementID];
  }

  async findScheduled(): Promise<Announcement[]> {
    return Object.entries(this.datastore)
      .filter(([_, value]) => value?.status.value === AnnouncementStatus.scheduled)
      .map(([_, value]) => value) as Announcement[];
  }

  async findByShortID(shortID: number, guildID: string) {
    const kv = Object.entries(this.datastore).filter(
      (kv) => kv[1]?.shortID === shortID && kv[1]?.guildID === guildID,
    );
    const a = kv.shift();
    return a ? a[1] : undefined;
  }

  public async save(announcement: Announcement) {
    const existing = this.datastore[announcement.id.value];
    if (existing) {
      this.datastore[announcement.id.value] = existing.copy({
        channelID: announcement.channelID,
        message: announcement.message,
        scheduledTime: announcement.scheduledTime,
        status: announcement.status,
      });
    } else {
      this.datastore[announcement.id.value] = announcement;
    }
  }

  async delete(announcement: Announcement): Promise<void> {
    delete this.datastore[announcement.id.value];
  }
}
