import { Guild } from "discord.js";
import { getConnection } from "typeorm";
import { v4 } from "uuid";
import { logger } from "../infra/logger";
import { CONNECTION_NAME } from "../constants";
import { GuildSettings } from "../infra/typeorm/models";

export function makeOnGuildCreate() {
  const connection = getConnection(CONNECTION_NAME);
  const repo = connection.getRepository(GuildSettings);

  return async function onGuildCreate(guild: Guild) {
    const meta = { guildID: guild.id, guildName: guild.name };
    logger.info("[onGuildCreate>>>>]", meta);
    const start = Date.now();
    try {
      let existing = await repo.findOne({ guild_id: guild.id });
      if (existing) {
        existing.active = true;
      } else {
        existing = new GuildSettings();
        existing.guild_settings_id = v4();
        existing.guild_id = guild.id;
      }
      await repo.save(existing);
    } catch (e) {
      logger.error(e, { guildID: guild.id, guild: guild.name });
    }
    logger.info(`[onGuildCreate] Bot added to server: ${guild.name}`, { guildID: guild.id });
    logger.info(`[onGuildCreate<<<<] - ${Date.now() - start}ms`, meta);
  };
}
