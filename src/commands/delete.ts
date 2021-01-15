import { Message } from "discord.js";
import { deleteAnnouncement } from "../core/announcement/interactions/deleteAnnouncement";
import { PREFIX } from "../constants";
import {
  AnnouncementOutput,
  InteractionDependencies,
} from "../core/announcement/interactions/common";
import { Args } from "./definitions/Args";
import { Response } from "../lib";

export const help = {
  name: "delete",
  category: "Scheduling",
  description: "Deletes and un-schedules an announcement",
  usage: `${PREFIX}delete`,
};

export const conf = {
  enabled: true,
  guildOnly: true,
};

export async function interaction(props: InteractionDependencies, message: Message, args: Args) {
  const announcementID = args.firstArg;
  return await deleteAnnouncement({ announcementID }, props);
}

export async function onSuccess(message: Message, response: Response<AnnouncementOutput>) {
  const announcementID = (response.value as AnnouncementOutput).id;
  await message.channel.send(`Announcement: \`${announcementID}\` was deleted.`);
}
