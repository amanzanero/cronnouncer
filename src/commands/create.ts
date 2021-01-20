import { Message } from "discord.js";
import { createAnnouncement } from "../core/announcement/interactions/createAnnouncement";
import { PREFIX } from "../constants";
import {
  AnnouncementOutput,
  InteractionDependencies,
} from "../core/announcement/interactions/common";
import { Response } from "../core/lib";
import { announcementStringEmbed } from "./util/announcementString";

export const help = {
  name: "create",
  category: "Scheduling",
  description: "Creates a new announcement",
  usage: `${PREFIX}create`,
  example: `${PREFIX}create`,
};

export const conf = {
  enabled: true,
  guildOnly: true,
};

export async function interaction(props: InteractionDependencies, message: Message) {
  const guildID = message.guild?.id as string;
  return await createAnnouncement({ guildID }, props);
}

export async function onSuccess(message: Message, response: Response<AnnouncementOutput>) {
  await message.channel.send("Announcement started!");
  await message.channel.send(announcementStringEmbed(response.value as AnnouncementOutput));
}
