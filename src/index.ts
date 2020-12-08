import * as Discord from "discord.js";
import { DISCORD_TOKEN } from "./constants";
import { logger } from "./services";

const discordBot = new Discord.Client();

discordBot.on("ready", () => {
  logger.info(`CRONNOUNCER READY!`);
});

discordBot.on("message", function (message) {
  if (message.content === "!ping") {
    message.channel.send("pong!");
    logger.info(`[!ping] user: ${message.author} sent: ${message.createdAt}`);
  }
});

discordBot.login(DISCORD_TOKEN).catch((e) => {
  logger.error(e);
});
