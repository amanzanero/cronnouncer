/**
 * his file contains a repository composer for announcements
 */

import { GuildID } from "../domain/announcement";
import { AnnouncementSettings as AnnouncementSettingsModel } from "../../../infra/typeorm/models";
import { Repository } from "typeorm";
import { AnnouncementSettings } from "../domain/announcementSettings";
import { AnnouncementSettingsMap } from "./AnnouncementSettingsMap";

export interface IAnnouncementSettingsRepo {
  getByGuildID(guildID: GuildID): Promise<AnnouncementSettings | undefined>;

  save(announcementSettings: AnnouncementSettings): Promise<void>;
}

export class AnnouncementSettingsRepo implements IAnnouncementSettingsRepo {
  private typeormASettingsRepo: Repository<AnnouncementSettingsModel>;

  constructor(typeormRepo: Repository<AnnouncementSettingsModel>) {
    this.typeormASettingsRepo = typeormRepo;
  }

  async getByGuildID(guildID: GuildID): Promise<AnnouncementSettings | undefined> {
    const settings = await this.typeormASettingsRepo.findOne({ guild_id: guildID.value });
    return settings && AnnouncementSettingsMap.toDomain(settings);
  }

  async save(announcementSettings: AnnouncementSettings): Promise<void> {
    const persistModel = AnnouncementSettingsMap.toPersistence(announcementSettings);
    await this.typeormASettingsRepo.save(persistModel);
  }
}
