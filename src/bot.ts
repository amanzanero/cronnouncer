import Discord from "discord.js";

import { DEBUG, DISCORD_TOKEN, IS_PROD } from "./constants";
import { logger } from "./services";
import handleMessages from "./handlers/message";

export async function main(): Promise<string> {
  const discordClient = new Discord.Client();
  logger.info("starting cronnouncer...");

  if (!IS_PROD) logger.info(`[DEV] pid: ${process.pid}`);

  if (DEBUG) {
    discordClient.on("debug", (debugStatement) => logger.info(`[DEBUG] ${debugStatement}`));
  }
  discordClient.on("ready", () => logger.info("cronnoucer live"));

  discordClient.on("message", handleMessages);

  process.on("SIGTERM", () => {
    logger.info("shutting down cronnouncer...");
    discordClient.destroy();
    logger.info("cronnoucer shutdown");
    process.exit(0);
  });

  return await discordClient.login(DISCORD_TOKEN);
}
