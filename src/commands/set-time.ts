import { Message } from "discord.js";
import { Command } from "./definitions";
import { IAnnouncementRepo } from "../core/announcement/repos";
import { makeSetTime } from "../core/announcement/interactions/setTime";
import { Args } from "./config/Args";
import { AnnouncementOutput } from "../core/announcement/interactions/common";
import { Response } from "../lib";
import { executeBase } from "./executeBase";
import { PREFIX } from "../constants";

interface SetTimeCMDProps {
  announcementRepo: IAnnouncementRepo;
}

export const help = {
  name: "set-time",
  category: "Scheduling",
  description: "Sets the time for the in progress announcement",
  usage: `${PREFIX}set-time {MM/DD/YYYY hh:mm am/pm}`,
};

const conf = {
  enabled: true,
  guildOnly: true,
};

export function makeSetTimeCMD(props: SetTimeCMDProps): Command {
  // interaction init
  const setTime = makeSetTime(props.announcementRepo);

  async function interaction(message: Message, args: Args) {
    return await setTime({
      guildID: message.guild?.id,
      scheduledTime: args.raw,
    } as any);
  }

  async function onSuccess(message: Message, response: Response<AnnouncementOutput>) {
    await message.channel.send(
      `Time: ${response.value?.scheduledTime} was set for the announcement.`,
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
