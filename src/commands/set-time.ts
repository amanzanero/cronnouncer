import { Message } from "discord.js";
import { Args } from "./definitions/Args";
import {
  AnnouncementOutput,
  InteractionDependencies,
} from "../core/announcement/interactions/common";
import { Response } from "../lib";
import { PREFIX } from "../constants";
import { editAnnouncementInfo } from "../core/announcement/interactions/editAnnouncementInfo";
import { announcementStringEmbed } from "./util/announcementString";

export const help = {
  name: "set-time",
  category: "Scheduling",
  description: "Sets the time for the in progress announcement",
  usage: `${PREFIX}set-time {announcement id} {MM/DD/YYYY hh:mm am/pm}`,
};

export const conf = {
  enabled: true,
  guildOnly: true,
};

export async function interaction(props: InteractionDependencies, message: Message, args: Args) {
  const guildID = message.guild?.id as string;
  const announcementID = args.firstArg;
  const rawTime = args.raw.substring(announcementID.length).trim();
  return await editAnnouncementInfo({ announcementID, guildID, scheduledTime: rawTime }, props);
}

export async function onSuccess(message: Message, response: Response<AnnouncementOutput>) {
  await message.channel.send(announcementStringEmbed(response.value as AnnouncementOutput));
}
