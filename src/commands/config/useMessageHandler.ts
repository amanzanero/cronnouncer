import { Client, Message } from "discord.js";
import { CommandMap } from "../definitions";
import { isCommand, parseCommand } from "../../lib/parser";
import { logger } from "../../services";
import { UNKNOWN_COMMAND_RESPONSE } from "../index";

export function useMessageHandler(client: Client, commands: CommandMap) {
  return async (message: Message) => {
    if (message.author.bot) return; // we dont fuk w bots

    /**
     * Will add setting stuff here
     */

    if (!isCommand(message.content)) return;
    const { command, args } = parseCommand(message.content);

    // handle wrong command
    const cmd = commands[command];
    if (!cmd) {
      try {
        await message.channel.send(UNKNOWN_COMMAND_RESPONSE);
      } catch (e) {
        logger.error(e.stack);
      }
      return;
    }

    // execute actual command
    logger.info(
      `[CMD] ${message.author.username} (${message.author.id}) ran command ${cmd.help.name}`,
    );
    try {
      await cmd.execute(client, message, args);
    } catch (e) {
      logger.error(e.stack);
    }
  };
}
