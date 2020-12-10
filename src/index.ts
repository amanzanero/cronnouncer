import { DEBUG, DISCORD_TOKEN, IS_PROD } from "./constants";
import { discordService, logger } from "./services";
import handleMessages from "./handlers/message";

function main() {
  logger.info("starting cronnouncer...");

  const { client: discordClient } = discordService;
  if (!IS_PROD) logger.info(`[DEV] pid: ${process.pid}`);

  if (DEBUG) {
    discordClient.on("debug", (debugStatement) => logger.info(`[DEBUG] ${debugStatement}`));
  }
  discordClient.on("ready", () => {
    discordService.ready = true;
    logger.info(`cronnouncer ready`);
  });

  discordClient.on("message", handleMessages);

  discordClient.login(DISCORD_TOKEN).catch((e) => logger.error(e.stack));

  process.on("SIGTERM", () => {
    logger.info("shutting down cronnouncer...");
    discordClient.destroy();
    logger.info("cronnoucer shutdown");
  });
}

main();
