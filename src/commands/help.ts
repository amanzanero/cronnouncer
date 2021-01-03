import { Message } from "discord.js";
import { Command } from "./definitions";
import { help as setChannelHelp } from "./set-channel";
import { help as setMessageHelp } from "./set-message";
import { help as setTimeHelp } from "./set-time";
import { help as startAnnouncementHelp } from "./start-announcement";
import { PREFIX } from "../constants";
import { logger } from "../util";

const help = {
  name: "help",
  category: "Miscellaneous",
  description: "Get list of available commands",
  usage: `${PREFIX}help`,
};

const conf = {
  enabled: true,
  guildOnly: false,
};

const HELP_ARRAY = [startAnnouncementHelp, setChannelHelp, setMessageHelp, setTimeHelp, help];

function descriptionLine(help: Command["help"]) {
  return `**${PREFIX}${help.name}** ${help.description}`;
}

function usageLine(help: Command["help"]) {
  return `    usage: \`${help.usage}`;
}

export const HELP_MESSAGE = HELP_ARRAY.reduce((acc, curr) => {
  return `${acc}> ${descriptionLine(curr)}\n> ${usageLine(curr)}\`\n`;
}, "");

export function makeHelpCMD(): Command {
  // interaction init

  return {
    execute: async function execute(message: Message) {
      try {
        await message.channel.send(HELP_MESSAGE);
      } catch (e) {
        logger.error(e.stack);
      }
    },
    help,
    conf,
  };
}
