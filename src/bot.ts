import Discord from "discord.js";

import { DISCORD_TOKEN, IS_PROD } from "./constants";
import { logger } from "./util";
import { makeCommandMap, makeMessageHandler } from "./commands";
import { initDB } from "./infra/typeorm";

export async function main(): Promise<string> {
  /* istanbul ignore next */
  if (!IS_PROD) logger.level = "debug";

  logger.debug(`pid: ${process.pid}`);
  logger.info("starting cronnouncer...");

  const { stores, storesDisconnect } = await initDB();

  const discordClient = new Discord.Client();
  const commands = makeCommandMap({ stores, discordClient });
  const messageHandler = makeMessageHandler(discordClient, commands);

  discordClient.on("ready", () => {
    logger.info("logged into discord");
    logger.info("cronnouncer ready to accept messages");
  });
  discordClient.on("message", messageHandler);

  // graceful exit
  process.on("SIGTERM", async () => {
    logger.info("shutting down cronnouncer...");
    try {
      discordClient.destroy();
      await storesDisconnect();
    } catch (e) {
      logger.error(e);
      process.exit(1);
    }
    logger.info("cronnouncer shutdown");
    process.exit(0);
  });

  logger.info("logging into discord...");
  return await discordClient.login(DISCORD_TOKEN);
}
