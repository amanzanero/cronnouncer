import { Message } from "discord.js";
import * as messageHandlers from "./message";

export default async function handleMessages(message: Message): Promise<void> {
  switch (message.content) {
    case "!ping":
      await messageHandlers.handlePing(message);
      break;
    default:
      break;
  }
}
