import { Message } from "discord.js";
import { startAnnouncement } from "../core/announcement/interactions/startAnnouncement";
import { PREFIX } from "../constants";
import { InteractionDependencies } from "../core/announcement/interactions/common";

export const help = {
  name: "start-announcement",
  category: "Scheduling",
  description: "Begins the scheduling process for an announcement",
  usage: `${PREFIX}start-announcement`,
};

export const conf = {
  enabled: true,
  guildOnly: true,
};

export async function interaction(props: InteractionDependencies, message: Message) {
  const guildID = message.guild?.id as string;
  return await startAnnouncement({ guildID }, props);
}

export async function onSuccess(message: Message) {
  await message.channel.send("Announcement started!");
}
