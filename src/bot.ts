import Discord from "discord.js";

import { DISCORD_TOKEN, IS_PROD } from "./constants";
import { logger } from "./util";
import { makeCommandMap, makeMessageHandler } from "./commands";
import { initDB } from "./infra/typeorm";

export async function main(): Promise<string> {
  /* istanbul ignore next */
  if (!IS_PROD) logger.info(`[DEV] pid: ${process.pid}`);
  logger.info("starting cronnouncer...");

  const { stores, storesDisconnect } = await initDB();

  const discordClient = new Discord.Client();
  const commands = makeCommandMap({ stores, discordClient });
  const messageHandler = makeMessageHandler(discordClient, commands);

  discordClient.on("ready", () => logger.info("cronnouncer live"));
  discordClient.on("message", messageHandler);

  // graceful exit
  process.on("SIGTERM", async () => {
    logger.info("shutting down cronnouncer...");
    try {
      discordClient.destroy();
      await storesDisconnect();
    } catch (e) {
      logger.error(e.stack);
    }
    logger.info("cronnouncer shutdown");
    process.exit(0);
  });

  return await discordClient.login(DISCORD_TOKEN);
}
