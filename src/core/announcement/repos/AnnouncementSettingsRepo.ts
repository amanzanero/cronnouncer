/**
 * his file contains a repository composer for announcements
 */

import { GuildID } from "../domain/announcement";
import { AnnouncementSettings as AnnouncementSettingsModel } from "../../../infra/typeorm/models";
import { In, Repository } from "typeorm";
import { AnnouncementSettings } from "../domain/announcementSettings";
import { AnnouncementSettingsMap } from "./AnnouncementSettingsMap";

export interface IAnnouncementSettingsRepo {
  findByGuildID(guildID: GuildID): Promise<AnnouncementSettings | undefined>;

  findByGuildIDs(guildIDs: GuildID[]): Promise<{ [guildID: string]: AnnouncementSettings }>;

  save(announcementSettings: AnnouncementSettings): Promise<void>;
}

export class AnnouncementSettingsRepo implements IAnnouncementSettingsRepo {
  private typeormASettingsRepo: Repository<AnnouncementSettingsModel>;

  constructor(typeormRepo: Repository<AnnouncementSettingsModel>) {
    this.typeormASettingsRepo = typeormRepo;
  }

  async findByGuildID(guildID: GuildID): Promise<AnnouncementSettings | undefined> {
    const settings = await this.typeormASettingsRepo.findOne({ guild_id: guildID.value });
    return settings && AnnouncementSettingsMap.toDomain(settings);
  }

  async findByGuildIDs(guildIDs: GuildID[]) {
    const stringifiedGuildIDs = guildIDs.map((gID) => gID.value);
    const settings = await this.typeormASettingsRepo.find({ guild_id: In(stringifiedGuildIDs) });

    const domainAnnouncementSettings: { [guildID: string]: AnnouncementSettings } = {};
    return settings.reduce((acc, rawSetting) => {
      const domainSetting = AnnouncementSettingsMap.toDomain(rawSetting);
      if (!!domainSetting) {
        Object.assign(acc, { [rawSetting.guild_id]: domainSetting });
      }
      return acc;
    }, domainAnnouncementSettings);
  }

  async save(announcementSettings: AnnouncementSettings): Promise<void> {
    const persistModel = AnnouncementSettingsMap.toPersistence(announcementSettings);
    await this.typeormASettingsRepo.save(persistModel);
  }
}
