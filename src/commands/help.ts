import { PREFIX } from "../constants";
import { logger } from "../infra/logger";
import { baseEmbed } from "./util/baseEmbed";
import { Command } from "./definitions";
import { help as setChannelHelp } from "./set-channel";
import { help as setMessageHelp } from "./set-message";
import { help as setTimeHelp } from "./set-time";
import { help as scheduleHelp } from "./schedule";
import { help as createHelp } from "./create";
import { help as unschdeuleHelp } from "./unschedule";
import { help as timezoneHelp } from "./timezone";
import { help as listHelp } from "./list";
import { help as viewHelp } from "./view";
import { help as deleteHelp } from "./delete";
import { help as pingHelp } from "./ping";
import { INTERNAL_ERROR_RESPONSE } from "./util/errors";

const help = {
  name: "help",
  category: "Miscellaneous",
  description: "Get list of available commands",
  usage: `${PREFIX}help`,
  example: `${PREFIX}help`,
};

const conf = {
  enabled: true,
  guildOnly: false,
};

const HELP_ARRAY = [
  timezoneHelp,
  createHelp,
  setChannelHelp,
  setMessageHelp,
  setTimeHelp,
  scheduleHelp,
  unschdeuleHelp,
  listHelp,
  viewHelp,
  deleteHelp,
  pingHelp,
  help,
];

export function helpEmbed() {
  const embed = baseEmbed();
  embed.setTitle("Commands");
  embed.setDescription(
    "To use this bot, you must create a role called `Announcer`. Only those with this role will be able to run any of the following commands.",
  );
  HELP_ARRAY.forEach((help) => {
    embed.addFields(
      { name: `__${help.usage}__`, value: help.description },
      {
        name: "example",
        value: `\`\`\`${help.example}\`\`\``,
      },
    );
  });
  embed.setTimestamp();
  return embed;
}

export function makeHelpCMD(): Command {
  // interaction init

  return {
    execute: async function execute({ meta, message }) {
      try {
        logger.info("[help] help message sent", meta);
        await message.channel.send(helpEmbed());
      } catch (e) {
        logger.error(e, meta);
        await message.channel.send(INTERNAL_ERROR_RESPONSE);
      }
    },
    help,
    conf,
  };
}
