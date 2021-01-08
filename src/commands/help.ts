import { Command } from "./definitions";
import { help as setChannelHelp } from "./set-channel";
import { help as setMessageHelp } from "./set-message";
import { help as setTimeHelp } from "./set-time";
import { help as publishHelp } from "./publish";
import { help as startAnnouncementHelp } from "./start-announcement";
import { help as timezoneHelp } from "./timezone";
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

const HELP_ARRAY = [
  timezoneHelp,
  startAnnouncementHelp,
  setChannelHelp,
  setMessageHelp,
  setTimeHelp,
  publishHelp,
  help,
];

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
    execute: async function execute({ requestID, message }) {
      try {
        await message.channel.send(HELP_MESSAGE);
      } catch (e) {
        logger.error(e, { requestID });
      }
    },
    help,
    conf,
  };
}
