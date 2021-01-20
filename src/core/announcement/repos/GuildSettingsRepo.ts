/**
 * his file contains a repository composer for announcements
 */

import { GuildSettings as GuildSettingsModel } from "../../../infra/typeorm/models";
import { In, Repository } from "typeorm";
import { GuildSettings } from "../domain/guildSettings";
import { GuildSettingsMap } from "./GuildSettingsMap";

export interface IGuildSettingsRepo {
  findByGuildID(guildID: string): Promise<GuildSettings | undefined>;

  findByGuildIDs(guildIDs: string[]): Promise<{ [guildID: string]: GuildSettings }>;

  save(guildSettings: GuildSettings): Promise<void>;
}

export class GuildSettingsRepo implements IGuildSettingsRepo {
  private typeormGuildSettingsRepo: Repository<GuildSettingsModel>;

  constructor(typeormRepo: Repository<GuildSettingsModel>) {
    this.typeormGuildSettingsRepo = typeormRepo;
  }

  async findByGuildID(guildID: string): Promise<GuildSettings | undefined> {
    const settings = await this.typeormGuildSettingsRepo.findOne({ guild_id: guildID });
    return settings && GuildSettingsMap.toDomain(settings);
  }

  async findByGuildIDs(guildIDs: string[]) {
    const settings = await this.typeormGuildSettingsRepo.find({
      guild_id: In(guildIDs),
    });

    const domainGuildSettings: { [guildID: string]: GuildSettings } = {};
    return settings.reduce((acc, rawSetting) => {
      const domainSetting = GuildSettingsMap.toDomain(rawSetting);
      if (!!domainSetting) {
        Object.assign(acc, { [rawSetting.guild_id]: domainSetting });
      }
      return acc;
    }, domainGuildSettings);
  }

  async save(guildSettings: GuildSettings): Promise<void> {
    const persistModel = GuildSettingsMap.toPersistence(guildSettings);
    await this.typeormGuildSettingsRepo.save(persistModel);
  }
}
