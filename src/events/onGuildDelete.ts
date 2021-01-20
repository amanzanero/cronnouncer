import { Guild } from "discord.js";
import { logger } from "../infra/logger";

export function makeOnGuildDelete() {
  return function onGuildDelete(guild: Guild) {
    logger.info(`Bot removed from server: ${guild.name}`, { guildID: guild.id });
  };
}
