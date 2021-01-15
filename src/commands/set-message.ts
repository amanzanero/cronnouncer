import { Message } from "discord.js";
import { Args } from "./definitions/Args";
import { PREFIX } from "../constants";
import {
  AnnouncementOutput,
  InteractionDependencies,
} from "../core/announcement/interactions/common";
import { editAnnouncementInfo } from "../core/announcement/interactions/editAnnouncementInfo";
import { announcementStringEmbed } from "./util/announcementString";
import { Response } from "../lib";

export const help = {
  name: "set-message",
  category: "Scheduling",
  description: "Sets the message for the in-progress announcement",
  usage: `${PREFIX}set-message {announcement id} {announcement content}`,
};

export const conf = {
  enabled: true,
  guildOnly: true,
};

export async function interaction(props: InteractionDependencies, message: Message, args: Args) {
  const guildID = message.guild?.id as string;
  const announcementID = args.firstArg;
  const rawMessage = args.raw.substring(announcementID.length).trim();

  console.log({ args, announcementID, rawMessage });
  return await editAnnouncementInfo({ announcementID, guildID, message: rawMessage }, props);
}

export async function onSuccess(message: Message, response: Response<AnnouncementOutput>) {
  await message.channel.send(announcementStringEmbed(response.value as AnnouncementOutput));
}
