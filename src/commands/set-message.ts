import { Message } from "discord.js";
import { PREFIX } from "../constants";
import {
  AnnouncementOutput,
  InteractionDependencies,
} from "../core/announcement/interactions/common";
import { editAnnouncementInfo } from "../core/announcement/interactions/editAnnouncementInfo";
import { Response } from "../core/lib";
import { announcementStringEmbed } from "./util/announcementString";
import { Args } from "./definitions/Args";

export const help = {
  name: "set-message",
  category: "Scheduling",
  description: "Sets the message for the in-progress announcement",
  usage: `${PREFIX}set-message {announcement id} {announcement content}`,
  example: `${PREFIX}set-message 8fc3d953-f46c-4432-ae85-09e82a3fd81a One super awesome announcement`,
};

export const conf = {
  enabled: true,
  guildOnly: true,
};

export async function interaction(props: InteractionDependencies, message: Message, args: Args) {
  const guildID = message.guild?.id as string;
  const announcementID = args.firstArg;
  const rawMessage = args.raw.substring(announcementID.length).trim();

  return await editAnnouncementInfo(
    { announcementID: parseInt(announcementID), guildID, message: rawMessage },
    props,
  );
}

export async function onSuccess(message: Message, response: Response<AnnouncementOutput>) {
  await message.channel.send(announcementStringEmbed(response.value as AnnouncementOutput));
}
