import { DISCORD_TOKEN, IS_PROD } from "./constants";
import { logger } from "./infra/logger";
import {
  onStartup,
  makeMessageHandler,
  makeOnGuildCreate,
  makeOnShutdown,
  makeOnReady,
  makeOnGuildDelete,
} from "./events";

export async function main(): Promise<string> {
  /* istanbul ignore next */
  if (!IS_PROD) logger.level = "debug";

  logger.debug(`pid: ${process.pid}`);
  logger.info("starting cronnouncer...");

  const deps = await onStartup();
  const { discordClient } = deps;

  const onReady = makeOnReady(deps);
  const messageHandler = makeMessageHandler(deps);
  const onGuildCreate = makeOnGuildCreate();
  const onGuildDelete = makeOnGuildDelete();

  discordClient.on("ready", onReady);
  discordClient.on("message", messageHandler);
  discordClient.on("guildCreate", onGuildCreate);
  discordClient.on("guildDelete", onGuildDelete);

  // graceful exit
  const onShutdown = makeOnShutdown(deps);
  process.on("SIGTERM", onShutdown);
  process.on("SIGINT", onShutdown);

  logger.info("logging into discord...");
  return await discordClient.login(DISCORD_TOKEN);
}

main().catch((e) => {
  logger.error(e);
  process.exit(-1);
});
