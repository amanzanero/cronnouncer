import { Message } from "discord.js";
import * as messageHandlers from "./message";

import { parseCommand } from "../parser";

export default async function handleMessages(message: Message): Promise<void> {
  const { content: incoming } = message;
  const command = parseCommand(incoming);

  switch (command) {
    case "ping":
      await messageHandlers.handlePing(message);
      break;
    default:
      break;
  }
}
