import { Client, Message } from "discord.js";
import { logger } from "../services";
import { Command } from "./definitions";
import { IAnnouncementRepo } from "../core/announcement/repos/AnnouncementRepo";
import { makeSetTime } from "../core/announcement/interactions/setTime";
import {
  AnnouncementError,
  AnnouncementNotInProgressError,
  ValidationError,
} from "../core/announcement/errors";

interface SetTimeCMDProps {
  announcementRepo: IAnnouncementRepo;
}

export const help = {
  name: "set-time",
  category: "Scheduling",
  description: "Sets the time for the in progress announcement",
  usage: "set-time {MM/DD/YYYY hh:mm am/pm}",
};

const conf = {
  enabled: true,
  guildOnly: true,
};

export function makeSetTimeCMD(props: SetTimeCMDProps): Command {
  // interaction init
  const setTime = makeSetTime(props.announcementRepo);

  return {
    execute: async function execute(client: Client, message: Message, args: string[]) {
      try {
        const scheduledTime = args.join(" ");
        const response = await setTime({
          guildID: message.guild?.id,
          scheduledTime,
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
            default:
              return;
          }
          return;
        }

        await message.channel.send(`Time: ${scheduledTime} was set for the announcement.`);
      } catch (e) {
        logger.error(e.stack);
      }
    },
    help,
    conf,
  };
}
