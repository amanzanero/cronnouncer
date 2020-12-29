/**
 * his file contains a repository composer for announcements
 */

import { Announcement, GuildID } from "../domain";
import { Announcement as AnnouncementModel } from "../../../infra/typeorm/announcementModel";
import { Repository } from "typeorm";
import { AnnouncementMap } from "./AnnouncementMap";

export interface IAnnouncementRepo {
  findWorkInProgressByGuildId(guildID: GuildID): Promise<Announcement | undefined>;

  save(announcement: Announcement): Promise<void>;
}

export class AnnouncementRepo implements IAnnouncementRepo {
  private typeormAnnouncementRepo: Repository<AnnouncementModel>;

  constructor(typeormRepo: Repository<AnnouncementModel>) {
    this.typeormAnnouncementRepo = typeormRepo;
  }

  async findWorkInProgressByGuildId(guildID: GuildID): Promise<Announcement | undefined> {
    const announcement = await this.typeormAnnouncementRepo.findOne({
      guild_id: guildID.value,
      published: false,
    });
    return announcement && AnnouncementMap.toDomain(announcement);
  }

  async save(announcement: Announcement): Promise<void> {
    const persist = AnnouncementMap.toPersistence(announcement);
    return await this.typeormAnnouncementRepo.save(persist);
  }
}
