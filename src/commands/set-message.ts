import { Message } from "discord.js";
import { setMessage } from "../core/announcement/interactions/setMessage";
import { Args } from "./definitions/Args";
import { PREFIX } from "../constants";
import { InteractionDependencies } from "../core/announcement/interactions/common";

export const help = {
  name: "set-message",
  category: "Scheduling",
  description: "Sets the message for the in-progress announcement",
  usage: `${PREFIX}set-time {announcement content}`,
};

export const conf = {
  enabled: true,
  guildOnly: true,
};

export async function interaction(props: InteractionDependencies, message: Message, args: Args) {
  const guildID = message.guild?.id as string;
  return await setMessage({ guildID, message: args.raw }, props);
}

export async function onSuccess(message: Message) {
  await message.channel.send("Message set for announcement.");
}
