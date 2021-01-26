import { Guild, Message } from "discord.js";
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
  usage: `${PREFIX}set-message {announcementID} {announcement content}`,
  example: `${PREFIX}set-message 33 One super awesome announcement`,
};

export const conf = {
  enabled: true,
  guildOnly: true,
};

export async function interaction(props: InteractionDependencies, message: Message, args: Args) {
  const guildID = (message.guild as Guild).id;
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
