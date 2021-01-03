import { Message } from "discord.js";
import { publishAnnouncement } from "../core/announcement/interactions/publishAnnouncement";
import { PREFIX } from "../constants";
import {
  AnnouncementOutput,
  InteractionDependencies,
} from "../core/announcement/interactions/common";
import { Response } from "../lib";

export const help = {
  name: "publish",
  category: "Scheduling",
  description: "Publishes the announcement and schedules it.",
  usage: `${PREFIX}publish`,
};

export const conf = {
  enabled: true,
  guildOnly: true,
};

export async function interaction(props: InteractionDependencies, message: Message) {
  const guildID = message.guild?.id as string;
  return await publishAnnouncement({ guildID }, props);
}

export async function onSuccess(message: Message, response: Response<AnnouncementOutput>) {
  const value = response.value as AnnouncementOutput;
  await message.channel.send(
    `Announcement scheduled for ${value.scheduledTime} on channel <#${value.channel}>`,
  );
}
