import { Guild } from "discord.js";
import { getConnection } from "typeorm";
import { logger } from "../infra/logger";
import { CONNECTION_NAME } from "../constants";
import { GuildSettings } from "../infra/typeorm/models";

export function makeOnGuildDelete() {
  const connection = getConnection(CONNECTION_NAME);
  const repo = connection.getRepository(GuildSettings);
  return async function onGuildDelete(guild: Guild) {
    const meta = { guildID: guild.id, guildName: guild.name };
    logger.info("[onGuildDelete>>>>]", meta);
    const start = Date.now();
    try {
      const guild_settings = await repo.findOne({ guild_id: guild.id });
      if (!guild_settings) {
        logger.warn(
          `[onGuildDelete] there were no settings saved for guild: ${guild.name} (${guild.id})`,
          meta,
        );
      } else {
        guild_settings.active = false;
        await repo.save(guild_settings);
      }
    } catch (e) {
      logger.error(e, meta);
    }
    logger.info(`[onGuildDelete] Bot removed from server: ${guild.name}`, { guildID: guild.id });
    logger.info(`[onGuildDelete<<<<] - ${Date.now() - start}ms`, meta);
  };
}
