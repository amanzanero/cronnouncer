import { Message } from "discord.js";
import { unScheduleAnnouncement } from "../core/announcement/interactions/unScheduleAnnouncement";
import { PREFIX } from "../constants";
import { InteractionDependencies } from "../core/announcement/interactions/common";
import { Args } from "./definitions/Args";

export const help = {
  name: "unschedule",
  category: "Scheduling",
  description: "Un-schedules an announcement that is scheduled to be sent",
  usage: `${PREFIX}unschedule`,
};

export const conf = {
  enabled: true,
  guildOnly: true,
};

export async function interaction(props: InteractionDependencies, message: Message, args: Args) {
  const announcementID = args.firstArg;
  return await unScheduleAnnouncement({ announcementID }, props);
}

export async function onSuccess(message: Message) {
  await message.channel.send("The announcement in progress was canceled and removed.");
}
