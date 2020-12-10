import { Message } from "discord.js";
import * as messageHandlers from "./message";

import { isCommand, parseCommand } from "../parser";

export default async function handleMessages(message: Message): Promise<void> {
  const { content: incoming } = message;
  if (!isCommand(incoming)) return;

  const command = parseCommand(incoming);
  switch (command) {
    case "ping":
      await messageHandlers.handlePing(message);
      break;
    default:
      break;
  }
}
