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
  name: "set-channel",
  category: "Scheduling",
  description: "Sets the channel for the in-progress announcement",
  usage: `${PREFIX}set-channel {discord channel name}`,
};

export const conf = {
  enabled: true,
  guildOnly: true,
};

export async function interaction(props: InteractionDependencies, message: Message, args: Args) {
  const [rawChannel] = args.argArray;
  const channel = parseDiscordChannelID(rawChannel);
  const guildID = message.guild?.id as string;

  return await editAnnouncementInfo({ guildID, channel }, props);
}

export async function onSuccess(message: Message, response: Response<AnnouncementOutput>) {
  const announcementOutput = response.value as AnnouncementOutput;
  await message.channel.send(
    `Channel: ${discordChannelString(announcementOutput.channel)} was set for the announcement.`,
  );
}

function parseDiscordChannelID(channel: string) {
  return channel && channel.substring(2, channel.length - 1);
}

function discordChannelString(channelID?: string) {
  return `<#${channelID}>`;
}
