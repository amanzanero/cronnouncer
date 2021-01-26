import { Guild, Message } from "discord.js";
import { deleteAnnouncement } from "../core/announcement/interactions/deleteAnnouncement";
import { PREFIX } from "../constants";
import {
  AnnouncementOutput,
  InteractionDependencies,
} from "../core/announcement/interactions/common";
import { Response } from "../core/lib";
import { Args } from "./definitions/Args";

export const help = {
  name: "delete",
  category: "Scheduling",
  description: "Deletes and un-schedules an announcement",
  usage: `${PREFIX}delete {announcementID}`,
  example: `${PREFIX}delete 33`,
};

export const conf = {
  enabled: true,
  guildOnly: true,
};

export async function interaction(props: InteractionDependencies, message: Message, args: Args) {
  const announcementID = parseInt(args.firstArg);
  const guildID = (message.guild as Guild).id as string;
  return await deleteAnnouncement({ announcementID, guildID }, props);
}

export async function onSuccess(message: Message, response: Response<AnnouncementOutput>) {
  const announcementID = (response.value as AnnouncementOutput).id;
  await message.channel.send(`Announcement: \`${announcementID}\` was deleted.`);
}
