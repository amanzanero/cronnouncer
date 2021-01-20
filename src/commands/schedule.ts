import { Message } from "discord.js";
import { scheduleAnnouncement } from "../core/announcement/interactions/scheduleAnnouncement";
import { PREFIX } from "../constants";
import {
  AnnouncementOutput,
  InteractionDependencies,
} from "../core/announcement/interactions/common";
import { Response } from "../core/lib";
import { Args } from "./definitions/Args";

export const help = {
  name: "schedule",
  category: "Scheduling",
  description: "Schedules the announcement to be sent.",
  usage: `${PREFIX}schedule {announcementID}`,
  example: `${PREFIX}schedule 33`,
};

export const conf = {
  enabled: true,
  guildOnly: true,
};

export async function interaction(props: InteractionDependencies, message: Message, args: Args) {
  const guildID = message.guild?.id as string;
  const announcementID = parseInt(args.firstArg);
  return await scheduleAnnouncement({ announcementID, guildID }, props);
}

export async function onSuccess(message: Message, response: Response<AnnouncementOutput>) {
  const value = response.value as AnnouncementOutput;
  await message.channel.send(
    `Announcement scheduled for ${value.scheduledTime} on channel <#${value.channelID}>`,
  );
}
