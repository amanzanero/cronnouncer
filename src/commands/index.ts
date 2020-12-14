import { Client, Message } from "discord.js";
import { CommandMap } from "./Command";
import { isCommand, parseCommand } from "../lib/parser";
import { PREFIX } from "../constants";
import { logger } from "../services";

export function useMessageHandler(client: Client, commands: CommandMap) {
  const prefixMention = new RegExp(`^<@!?${client.user?.id}>( |)$`);
  return async (message: Message) => {
    if (message.author.bot) return; // we dont fuk w bots

    /**
     * Will add setting stuff here
     */

    // Checks if the bot was mentioned, with no message after it, returns the prefix.
    if (client.user && message.content.match(prefixMention)) {
      return message.reply(`My prefix on this server is \`${PREFIX}\``);
    }

    if (!isCommand(message.content)) return;
    const { command, args } = parseCommand(message.content);

    // handle wrong command
    const cmd = commands[command];
    if (!cmd) {
      try {
        await message.channel.send(
          "Sorry I didn't understand that command.\nFor a list of commands, run `!help`.",
        );
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

export { generateCommands } from "./generateCommands";
