import { Message } from "discord.js";
import { scheduleAnnouncement } from "../core/announcement/interactions/scheduleAnnouncement";
import { PREFIX } from "../constants";
import {
  AnnouncementOutput,
  InteractionDependencies,
} from "../core/announcement/interactions/common";
import { Response } from "../lib";

export const help = {
  name: "schedule",
  category: "Scheduling",
  description: "Schedules the announcement to be sent.",
  usage: `${PREFIX}publish`,
};

export const conf = {
  enabled: true,
  guildOnly: true,
};

export async function interaction(props: InteractionDependencies, message: Message) {
  const guildID = message.guild?.id as string;
  return await scheduleAnnouncement({ guildID }, props);
}

export async function onSuccess(message: Message, response: Response<AnnouncementOutput>) {
  const value = response.value as AnnouncementOutput;
  await message.channel.send(
    `Announcement scheduled for ${value.scheduledTime} on channel <#${value.channel}>`,
  );
}
