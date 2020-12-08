import { Message } from "discord.js";
import * as messageHandlers from "./message";

export default function handleMessages(message: Message): void {
  switch (message.content) {
    case "!ping":
      messageHandlers.handlePing(message);
      break;
    default:
      break;
  }
}
