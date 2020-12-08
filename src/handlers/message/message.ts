/*
This file contains handlers for messages
 */
import { Message } from "discord.js";
import { logger } from "../../services";

export function handlePing(message: Message): void {
  message.channel.send("pong!🏓");
  logger.info(`[!ping] user: ${message.author} sent: ${message.createdAt}`);
}
