import * as Discord from "discord.js";

import { DISCORD_TOKEN } from "./constants";
import { logger } from "./services";
import handleMessages from "./handlers/message";

const discordBot = new Discord.Client();

discordBot.on("ready", () => {
  logger.info(`CRONNOUNCER READY!`);
});

discordBot.on("message", handleMessages);

discordBot.login(DISCORD_TOKEN).catch((e) => {
  logger.error(e);
});
