import { Client, Message } from "discord.js";
import { logger } from "../services";
import { Command } from "./definitions";
import { IAnnouncementRepo } from "../core/announcement/repos";
import { IDiscordService } from "../core/announcement/services/discord";
import { makeSetChannel } from "../core/announcement/interactions/setChannel";
import {
  AnnouncementError,
  AnnouncementNotInProgressError,
  ChannelDoesNotExistError,
  ValidationError,
} from "../core/announcement/errors";
import { Args } from "./config/Args";
import { AnnouncementOutput } from "../core/announcement/interactions/common";

interface SetTimeCMDProps {
  announcementRepo: IAnnouncementRepo;
  discordService: IDiscordService;
}

export const help = {
  name: "set-channel",
  category: "Scheduling",
  description: "Sets the channel for the in-progress announcement",
  usage: "set-channel {discord channel name}",
};

const conf = {
  enabled: true,
  guildOnly: true,
};

export function makeSetChannelCMD(props: SetTimeCMDProps): Command {
  // interaction init
  const setChannel = makeSetChannel(props.announcementRepo, props.discordService);

  return {
    execute: async function executeSetChannel(client: Client, message: Message, args: Args) {
      const [channel] = args.argArray;
      try {
        const response = await setChannel({
          guildID: message.guild?.id,
          channel: channel && channel.substring(2, channel.length - 1),
        } as any);

        if (response.failed) {
          const responseError = response.value as AnnouncementError;

          switch (responseError.constructor) {
            case ValidationError:
              await message.channel.send(responseError.message);
              break;
            case AnnouncementNotInProgressError:
              await message.channel.send("`There is no announcement in progress for this server.`");
              break;
            case ChannelDoesNotExistError:
              await message.channel.send(responseError.message);
              break;
            default:
              return;
          }
          return;
        }

        await message.channel.send(
          `Chanel: <#${
            (response.value as AnnouncementOutput).channel
          }> was set for the announcement.`,
        );
      } catch (e) {
        logger.error(e.stack);
        await message.channel.send("`Sorry, something unexpected happened.`");
      }
    },
    help,
    conf,
  };
}
