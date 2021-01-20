import { logger } from "../infra/logger";
import { Guild } from "discord.js";
import { InteractionDependencies } from "../core/announcement/interactions/common";

export function makeOnGuildCreate(deps: InteractionDependencies) {
  return async function onGuildCreate(guild: Guild) {
    logger.info(`Bot added to server: ${guild.name}`, { guildID: guild.id });
    try {
    } catch (e) {
      logger.error(e, { guildID: guild.id, guild: guild.name });
    }
  };
}
