import { Client, Message } from "discord.js";
import { Command } from "./definitions";
import { help as startAnnouncementHelp } from "./start-announcement";
import { help as setTimeHelp } from "./set-time";
import { PREFIX } from "../constants";
import { logger } from "../services";

const help = {
  name: "help",
  category: "Miscellaneous",
  description: "Get list of available commands",
  usage: "help",
};

const conf = {
  enabled: true,
  guildOnly: false,
};

export function makeHelpCMD(): Command {
  // interaction init
  const helpArray = [startAnnouncementHelp, setTimeHelp, help];
  const helpMessage = helpArray.reduce((acc, curr) => {
    return `${acc}${PREFIX}${curr.name} - ${curr.description}\n`;
  }, "");

  return {
    execute: async function execute(_: Client, message: Message) {
      try {
        await message.channel.send(`\`\`\`${helpMessage}\`\`\``);
      } catch (e) {
        logger.error(e.stack);
      }
    },
    help,
    conf,
  };
}
