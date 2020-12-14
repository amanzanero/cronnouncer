/*
This file contains commands for messages
 */
import { Client, Message } from "discord.js";
import { logger } from "../services";

async function execute(_: Client, message: Message) {
  try {
    await message.channel.send("pong!🏓");
  } catch (e) {
    logger.error(e.stack);
  }
}

const help = {
  name: "ping",
  category: "Miscellaneous",
  description: "It like... Pings. Then Pongs. And it's not Ping Pong.",
  usage: "ping",
};

const conf = {
  enabled: true,
  guildOnly: false,
};

export default {
  execute,
  help,
  conf,
};
