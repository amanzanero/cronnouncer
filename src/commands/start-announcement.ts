import { Message } from "discord.js";
import { Command } from "./definitions";
import { IAnnouncementRepo } from "../core/announcement/repos";
import { makeStartAnnouncement } from "../core/announcement/interactions/startAnnouncement";
import { executeBase } from "./executeBase";
import { Args } from "./config/Args";
import { PREFIX } from "../constants";

interface StartAnnouncementCMDProps {
  announcementRepo: IAnnouncementRepo;
}

export const help = {
  name: "start-announcement",
  category: "Scheduling",
  description: "Begins the scheduling process for an announcement",
  usage: `${PREFIX}start-announcement`,
};

const conf = {
  enabled: true,
  guildOnly: true,
};

export function makeStartAnnouncementCMD(props: StartAnnouncementCMDProps): Command {
  // interaction init
  const startAnnouncement = makeStartAnnouncement(props.announcementRepo);

  async function interaction(message: Message) {
    return await startAnnouncement({ guildID: message.guild?.id } as any);
  }

  async function onSuccess(message: Message) {
    await message.channel.send("Announcement started!");
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
