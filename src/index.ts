import * as Discord from "discord.js";

import { DEBUG, DISCORD_TOKEN } from "./constants";
import { logger } from "./services";
import handleMessages from "./handlers/message";

const discordBot = new Discord.Client();

function main() {
  logger.info("starting cronnouncer...");

  if (DEBUG) {
    discordBot.on("debug", (debugStatement) => logger.info(`[DEBUG] ${debugStatement}`));
  }
  discordBot.on("ready", () => logger.info(`cronnouncer ready`));
  discordBot.on("disconnect", () => logger.info(`cronnouncer ended`));

  discordBot.on("message", handleMessages);

  discordBot.login(DISCORD_TOKEN).catch((e) => logger.error(e.stack));
}

main();
