/**
 * his file contains a repository composer for announcements
 */

import { Repository } from "typeorm";
import { Announcement } from "../domain/announcement";
import { Announcement as AnnouncementModel } from "../../../infra/typeorm/models";
import { AnnouncementStatus } from "../domain/announcement/Status";
import { AnnouncementMap } from "./AnnouncementMap";

export interface IAnnouncementRepo {
  findByID(announcementID: string): Promise<Announcement | undefined>;

  findByShortID(shortID: number, guildID: string): Promise<Announcement | undefined>;

  findScheduled(): Promise<Announcement[]>;

  save(announcement: Announcement): Promise<void>;

  delete(announcement: Announcement): Promise<void>;
}

export class AnnouncementRepo implements IAnnouncementRepo {
  private typeormAnnouncementRepo: Repository<AnnouncementModel>;

  constructor(typeormRepo: Repository<AnnouncementModel>) {
    this.typeormAnnouncementRepo = typeormRepo;
  }

  async findByID(announcementID: string): Promise<Announcement | undefined> {
    const announcement = await this.typeormAnnouncementRepo.findOne({
      announcement_id: announcementID,
    });
    return announcement && AnnouncementMap.toDomain(announcement);
  }

  async findByShortID(shortID: number, guildID: string) {
    const announcement = await this.typeormAnnouncementRepo.findOne({
      short_id: shortID,
      guild_id: guildID,
    });
    return announcement && AnnouncementMap.toDomain(announcement);
  }

  async findScheduled(): Promise<Announcement[]> {
    const announcements = await this.typeormAnnouncementRepo.find({
      status: AnnouncementStatus.scheduled,
    });

    const domainAnnouncements: Announcement[] = [];
    return announcements.reduce((domAncmts, ancmt) => {
      const domAncmt = AnnouncementMap.toDomain(ancmt);
      if (!!domAncmt) domAncmts.push(domAncmt);
      return domAncmts;
    }, domainAnnouncements);
  }

  async save(announcement: Announcement): Promise<void> {
    const persist = AnnouncementMap.toPersistence(announcement);
    return await this.typeormAnnouncementRepo.save(persist);
  }

  async delete(announcement: Announcement): Promise<void> {
    const persist = AnnouncementMap.toPersistence(announcement);
    await this.typeormAnnouncementRepo.remove([persist]);
    return;
  }
}
