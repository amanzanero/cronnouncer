import { DISCORD_TOKEN, IS_PROD } from "./constants";
import { logger } from "./util";
import { makeCommandMap, makeMessageHandler } from "./commands";
import { onStartup, onShutdown, onReady } from "./events";

export async function main(): Promise<string> {
  /* istanbul ignore next */
  if (!IS_PROD) logger.level = "debug";

  logger.debug(`pid: ${process.pid}`);
  logger.info("starting cronnouncer...");

  const deps = await onStartup();
  const { discordClient } = deps;

  const commands = makeCommandMap(deps);
  const messageHandler = makeMessageHandler(discordClient, commands);

  discordClient.on("ready", async () => {
    logger.info("logged into discord");
    logger.info("cronnouncer ready to accept messages");
    await onReady(deps);
  });
  discordClient.on("message", messageHandler);
  discordClient.on("guildCreate", async (guild) => {
    logger.info(`Bot added to server: ${guild.name}`, { guildID: guild.id });
  });
  discordClient.on("guildDelete", (guild) => {
    logger.info(`Bot removed from server: ${guild.name}`, { guildID: guild.id });
  });

  // graceful exit
  process.on("SIGTERM", async () => {
    try {
      await onShutdown({ discordClient, closeDatabase: deps.storesDisconnect });
    } catch (e) {
      logger.error(e);
      process.exit(1);
    }
    process.exit(0);
  });

  logger.info("logging into discord...");
  return await discordClient.login(DISCORD_TOKEN);
}
