/**
 * his file contains a repository composer for announcements
 */

import { Announcement, GuildID } from "../domain/announcement";
import { Announcement as AnnouncementModel } from "../../../infra/typeorm/models";
import { Repository } from "typeorm";
import { AnnouncementMap } from "./AnnouncementMap";
import { AnnouncementStatus } from "../domain/announcement/Status";

export interface IAnnouncementRepo {
  findWorkInProgressByGuildID(guildID: GuildID): Promise<Announcement | undefined>;

  save(announcement: Announcement): Promise<void>;

  delete(announcement: Announcement): Promise<void>;
}

export class AnnouncementRepo implements IAnnouncementRepo {
  private typeormAnnouncementRepo: Repository<AnnouncementModel>;

  constructor(typeormRepo: Repository<AnnouncementModel>) {
    this.typeormAnnouncementRepo = typeormRepo;
  }

  async findWorkInProgressByGuildID(guildID: GuildID): Promise<Announcement | undefined> {
    const announcement = await this.typeormAnnouncementRepo.findOne({
      guild_id: guildID.value,
      status: AnnouncementStatus.active,
    });
    return announcement && AnnouncementMap.toDomain(announcement);
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
