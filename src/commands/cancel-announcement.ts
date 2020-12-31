import { Message } from "discord.js";
import { Command } from "./definitions";
import { IAnnouncementRepo } from "../core/announcement/repos";
import { makeCancelAnnouncement } from "../core/announcement/interactions/cancelAnnouncement";
import { Args } from "./config/Args";
import { executeBase } from "./executeBase";
import { PREFIX } from "../constants";

interface SetTimeCMDProps {
  announcementRepo: IAnnouncementRepo;
}

export const help = {
  name: "cancel-announcement",
  category: "Scheduling",
  description: "Cancels the announcement that is currently in progress and deletes it.",
  usage: `${PREFIX}cancel-announcement`,
};

const conf = {
  enabled: true,
  guildOnly: true,
};

export function makeCancelAnnouncementCMD(props: SetTimeCMDProps): Command {
  // interaction init
  const cancelAnnouncement = makeCancelAnnouncement(props.announcementRepo);

  async function interaction(message: Message) {
    return await cancelAnnouncement({
      guildID: message.guild?.id,
    } as any);
  }

  async function onSuccess(message: Message) {
    await message.channel.send("The announcement in progress was canceled and removed.");
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
