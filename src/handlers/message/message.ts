/*
This file contains handlers for messages
 */
import { Message } from "discord.js";
import { logger } from "../../services";

export async function handlePing(message: Message): Promise<void> {
  try {
    await message.channel.send("pong!🏓");
    logger.info(`[!ping] user: ${message.author} sent: ${message.createdAt}`);
  } catch (e) {
    logger.error(`[!ping] ${e.stack}`);
  }
}
