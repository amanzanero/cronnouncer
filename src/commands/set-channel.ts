import { Message } from "discord.js";
import {
  AnnouncementOutput,
  InteractionDependencies,
} from "../core/announcement/interactions/common";
import { Response } from "../core/lib";
import { PREFIX } from "../constants";
import { editAnnouncementInfo } from "../core/announcement/interactions/editAnnouncementInfo";
import { Args } from "./definitions/Args";
import { announcementStringEmbed } from "./util/announcementString";

export const help = {
  name: "set-channel",
  category: "Scheduling",
  description: "Sets the channel for the in-progress announcement",
  usage: `${PREFIX}set-channel {announcementID} {discord channel name}`,
  example: `${PREFIX}set-channel 33 #general`,
};

export const conf = {
  enabled: true,
  guildOnly: true,
};

export async function interaction(props: InteractionDependencies, message: Message, args: Args) {
  const [announcementID, rawChannel] = args.argArray;
  const channelID = parseDiscordChannelID(rawChannel);
  const guildID = message.guild?.id as string;

  return await editAnnouncementInfo(
    { announcementID: parseInt(announcementID), guildID, channelID },
    props,
  );
}

export async function onSuccess(message: Message, response: Response<AnnouncementOutput>) {
  const announcementOutput = response.value as AnnouncementOutput;
  await message.channel.send(announcementStringEmbed(announcementOutput));
}

function parseDiscordChannelID(channel: string) {
  return channel && channel.substring(2, channel.length - 1);
}
