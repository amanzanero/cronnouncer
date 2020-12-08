/*
This file contains handlers for messages
 */
import { Message } from "discord.js";
import { logger } from "../../services";

export function makeLogInfo(user: string): string {
  return `[!ping] user: ${user}`;
}

export async function handlePing(message: Message): Promise<void> {
  const logInfo = makeLogInfo(message.author.id);
  try {
    await message.channel.send("pong!🏓");
    logger.info(logInfo);
  } catch (e) {
    logger.error(`${logInfo} ${e.stack}`);
  }
}
