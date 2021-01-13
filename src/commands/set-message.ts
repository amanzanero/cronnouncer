import { Message } from "discord.js";
import { Args } from "./definitions/Args";
import { PREFIX } from "../constants";
import { InteractionDependencies } from "../core/announcement/interactions/common";
import { editAnnouncementInfo } from "../core/announcement/interactions/editAnnouncementInfo";

export const help = {
  name: "set-message",
  category: "Scheduling",
  description: "Sets the message for the in-progress announcement",
  usage: `${PREFIX}set-message {announcement content}`,
};

export const conf = {
  enabled: true,
  guildOnly: true,
};

export async function interaction(props: InteractionDependencies, message: Message, args: Args) {
  const guildID = message.guild?.id as string;
  return await editAnnouncementInfo({ guildID, message: args.raw }, props);
}

export async function onSuccess(message: Message) {
  await message.channel.send("Message set for announcement.");
}
