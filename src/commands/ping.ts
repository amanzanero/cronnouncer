/* istanbul ignore file  */
import { Client } from "discord.js";
import { PREFIX } from "../constants";
import { logger } from "../infra/logger";
import { ExecutorProps } from "./definitions";
import { INTERNAL_ERROR_RESPONSE } from "./util/errors";

export const help = {
  name: "ping",
  category: "Settings",
  description: "Returns latency stats",
  usage: `${PREFIX}ping`,
  example: `${PREFIX}ping`,
};

export const conf = {
  enabled: true,
  guildOnly: true,
};

export function makePingCMD({ discordClient }: { discordClient: Client }) {
  async function execute({ meta, message }: ExecutorProps) {
    try {
      const latency = Date.now() - message.createdTimestamp;
      const appLatency = latency < 0 ? 0 : latency;
      const discordApiLatency = Math.round(discordClient.ws.ping);
      await message.channel.send(
        `🏓 Latency is ${appLatency}ms. Discord API Latency is ${discordApiLatency}ms`,
      );
      logger.info(`[ping] sent stats`, meta);
    } catch (e) {
      logger.error(e, meta);
      await message.channel.send(INTERNAL_ERROR_RESPONSE);
    }
  }

  return {
    help,
    conf,
    execute,
  };
}
