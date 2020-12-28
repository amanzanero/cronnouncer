import { Client, Message } from "discord.js";
import { CommandMap } from "../definitions";
import { isCommand, parseCommand } from "../../lib";
import { logger } from "../../services";
import { UNKNOWN_COMMAND_RESPONSE } from "../index";

export function generateMessageHandler(client: Client, commands: CommandMap) {
  return async (message: Message) => {
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

    logger.info(
      `[CMD] ${message.author.username} (${message.author.id}) ran command ${cmd.help.name}`,
    );

    const invalidGuildCommand = cmd.conf.guildOnly && !message.guild;
    if (invalidGuildCommand) {
      await message.channel.send(
        `The command \`${cmd.help.name}\` can only be used from within a server.`,
      );
      return;
    }

    try {
      await cmd.execute(client, message, args);
    } catch (e) {
      logger.error(e.stack);
    }
  };
}
