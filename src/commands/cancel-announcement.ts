import { Message } from "discord.js";
import { cancelAnnouncement } from "../core/announcement/interactions/cancelAnnouncement";
import { PREFIX } from "../constants";
import { InteractionDependencies } from "../core/announcement/interactions/common";

export const help = {
  name: "cancel-announcement",
  category: "Scheduling",
  description: "Cancels the announcement that is currently in progress and deletes it.",
  usage: `${PREFIX}cancel-announcement`,
};

export const conf = {
  enabled: true,
  guildOnly: true,
};

export async function interaction(props: InteractionDependencies, message: Message) {
  const guildID = message.guild?.id as string;
  return await cancelAnnouncement({ guildID }, props);
}

export async function onSuccess(message: Message) {
  await message.channel.send("The announcement in progress was canceled and removed.");
}
