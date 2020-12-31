import { Guild, Message } from "discord.js";
import { Command } from "./definitions";
import { IAnnouncementRepo } from "../core/announcement/repos";
import { IDiscordService } from "../core/announcement/services/discord";
import { makeSetChannel } from "../core/announcement/interactions/setChannel";
import { Args } from "./config/Args";
import { executeBase } from "./executeBase";
import { AnnouncementOutput } from "../core/announcement/interactions/common";
import { Response } from "../lib";
import { PREFIX } from "../constants";

interface SetTimeCMDProps {
  announcementRepo: IAnnouncementRepo;
  discordService: IDiscordService;
}

export const help = {
  name: "set-channel",
  category: "Scheduling",
  description: "Sets the channel for the in-progress announcement",
  usage: `${PREFIX}set-channel {discord channel name}`,
};

const conf = {
  enabled: true,
  guildOnly: true,
};

export function makeSetChannelCMD(props: SetTimeCMDProps): Command {
  // interaction init
  const setChannel = makeSetChannel(props.announcementRepo, props.discordService);

  async function interaction(message: Message, args: Args) {
    const [rawChannel] = args.argArray;
    const channel = parseDiscordChannelID(rawChannel);

    const guild = message.guild as Guild; // ok to do since this is guild only
    return await setChannel({
      guildID: guild.id,
      channel,
    } as any);
  }

  async function onSuccess(message: Message, response: Response<AnnouncementOutput>) {
    const announcementOutput = response.value as AnnouncementOutput;
    await message.channel.send(
      `Channel: ${discordChannelString(announcementOutput.channel)} was set for the announcement.`,
    );
  }

  return {
    execute: async (message: Message, args: Args) => {
      await executeBase({
        interaction,
        onSuccess,
        message,
        args,
      });
    },
    help,
    conf,
  };
}

function parseDiscordChannelID(channel?: string) {
  return channel && channel.substring(2, channel.length - 1);
}

function discordChannelString(channelID?: string) {
  return `<#${channelID}>`;
}
