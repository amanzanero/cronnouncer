import { Client, Message } from "discord.js";
import { logger } from "../services";
import { Command } from "./definitions";
import { IAnnouncementRepo } from "../core/announcement/repos";
import { makeSetMessage } from "../core/announcement/interactions/setMessage";
import {
  AnnouncementError,
  AnnouncementNotInProgressError,
  ValidationError,
} from "../core/announcement/errors";
import { Args } from "./config/Args";

interface SetTimeCMDProps {
  announcementRepo: IAnnouncementRepo;
}

export const help = {
  name: "set-message",
  category: "Scheduling",
  description: "Sets the message for the in-progress announcement",
  usage: "set-time {announcement content}",
};

const conf = {
  enabled: true,
  guildOnly: true,
};

export function makeSetMessageCMD(props: SetTimeCMDProps): Command {
  // interaction init
  const setMessage = makeSetMessage(props.announcementRepo);

  return {
    execute: async function executeSetMessage(client: Client, message: Message, args: Args) {
      try {
        const response = await setMessage({
          guildID: message.guild?.id,
          message: args.raw,
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

        await message.channel.send(`Message set for announcement.`);
      } catch (e) {
        logger.error(e.stack);
        await message.channel.send("`Sorry, something unexpected happened.`");
      }
    },
    help,
    conf,
  };
}
