import { Client, Message } from "discord.js";
import { v4 as uuid } from "uuid";

import { CommandMap } from "./definitions";
import { isCommand, parseCommand } from "./util/parser";
import { logger } from "../util";
import { UNKNOWN_COMMAND_RESPONSE } from "./index";
import { PREFIX } from "../constants";

function commandRunLogStart(cmd: string) {
  return `${PREFIX}${cmd}>>>`;
}

function commandRunLogStop(cmd: string, time: number) {
  return `${PREFIX}${cmd}<<< - ${time}ms`;
}

export function makeMessageHandler(client: Client, commands: CommandMap) {
  return async function handleMessage(message: Message) {
    if (message.author.bot) return; // we dont fuk w bots
    if (!isCommand(message.content)) return;

    const { command, args } = parseCommand(message.content);

    // handle invalid command
    const cmd = commands[command];
    if (!cmd) {
      try {
        await message.channel.send(UNKNOWN_COMMAND_RESPONSE);
      } catch (e) {
        logger.error(e);
      }
      return;
    }

    const invalidGuildCommand = cmd.conf.guildOnly && !message.guild;
    if (invalidGuildCommand) {
      await message.channel.send(
        `The command \`${cmd.help.name}\` can only be used from within a server.`,
      );
      return;
    }

    const requestID = uuid();
    const user = message.author.tag;
    logger.info(commandRunLogStart(cmd.help.name), { requestID, user });

    const timeStart = Date.now();
    try {
      await cmd.execute({ requestID, message, args });
    } catch (e) {
      logger.error(e, { requestID });
    }
    logger.info(commandRunLogStop(cmd.help.name, Date.now() - timeStart), {
      requestID,
      user,
    });
  };
}
