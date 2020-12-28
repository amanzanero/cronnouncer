import { Client, Message } from "discord.js";
import { logger } from "../services";
import { Command } from "./definitions";
import { IAnnouncementRepo } from "../core/announcement/repos/AnnouncementRepo";
import { makeStartAnnouncement } from "../core/announcement/interactions/startAnnouncement";
import {
  AnnouncementError,
  AnnouncementInProgressError,
  ValidationError,
} from "../core/announcement/errors";

interface StartAnnouncementCMDProps {
  announcementRepo: IAnnouncementRepo;
}

export const help = {
  name: "start-announcement",
  category: "Scheduling",
  description: "Begins the scheduling process for an announcement",
  usage: "start-announcement",
};

const conf = {
  enabled: true,
  guildOnly: true,
};

export function makeStartAnnouncementCMD(props: StartAnnouncementCMDProps): Command {
  // interaction init
  const startAnnouncement = makeStartAnnouncement(props.announcementRepo);

  return {
    execute: async function execute(client: Client, message: Message) {
      try {
        const response = await startAnnouncement({ guildID: message.guild?.id } as any);

        if (response.failed) {
          const responseError = response.value as AnnouncementError;

          switch (responseError.constructor) {
            case ValidationError:
              await message.channel.send(responseError.message);
              break;
            case AnnouncementInProgressError:
              await message.channel.send("`Announcement in progress for this server.`");
              break;
            default:
              return;
          }
          return;
        }

        await message.channel.send("Announcement started!");
      } catch (e) {
        logger.error(e.stack);
      }
    },
    help,
    conf,
  };
}
