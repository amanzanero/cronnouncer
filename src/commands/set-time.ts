import { Message } from "discord.js";
import { Args } from "./definitions/Args";
import {
  AnnouncementOutput,
  InteractionDependencies,
} from "../core/announcement/interactions/common";
import { Response } from "../lib";
import { PREFIX } from "../constants";
import { editAnnouncementInfo } from "../core/announcement/interactions/editAnnouncementInfo";

export const help = {
  name: "set-time",
  category: "Scheduling",
  description: "Sets the time for the in progress announcement",
  usage: `${PREFIX}set-time {MM/DD/YYYY hh:mm am/pm}`,
};

export const conf = {
  enabled: true,
  guildOnly: true,
};

export async function interaction(props: InteractionDependencies, message: Message, args: Args) {
  const guildID = message.guild?.id as string;
  return await editAnnouncementInfo({ guildID, scheduledTime: args.raw }, props);
}

export async function onSuccess(message: Message, response: Response<AnnouncementOutput>) {
  await message.channel.send(
    `Time: ${response.value?.scheduledTime} was set for the announcement.`,
  );
}
