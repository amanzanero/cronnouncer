import { Client, Message } from "discord.js";
import { CommandMap } from "./definitions";
import { isCommand, parseCommand } from "./util/parser";
import { logger } from "../util";
import { UNKNOWN_COMMAND_RESPONSE } from "./index";

function commandRunLogStart(username: string, authorID: string, cmd: string) {
  return `[CMD] [${username}] [${authorID}] [START] [${cmd}]`;
}

function commandRunLogStop(username: string, authorID: string, cmd: string, time: number) {
  return `[CMD] [${username}] [${authorID}] [STOP] [${cmd}] - ${time}ms`;
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
        logger.error(e.stack);
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

    logger.info(commandRunLogStart(message.author.tag, message.author.id, cmd.help.name));
    const timeStart = Date.now();
    try {
      await cmd.execute(message, args);
    } catch (e) {
      logger.error(e.stack);
    }
    logger.info(
      commandRunLogStop(
        message.author.tag,
        message.author.id,
        cmd.help.name,
        Date.now() - timeStart,
      ),
    );
  };
}
