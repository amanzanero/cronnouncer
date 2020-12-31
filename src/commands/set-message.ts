import { Message } from "discord.js";
import { Command } from "./definitions";
import { IAnnouncementRepo } from "../core/announcement/repos";
import { makeSetMessage } from "../core/announcement/interactions/setMessage";
import { Args } from "./config/Args";
import { executeBase } from "./executeBase";
import { PREFIX } from "../constants";

interface SetTimeCMDProps {
  announcementRepo: IAnnouncementRepo;
}

export const help = {
  name: "set-message",
  category: "Scheduling",
  description: "Sets the message for the in-progress announcement",
  usage: `${PREFIX}set-time {announcement content}`,
};

const conf = {
  enabled: true,
  guildOnly: true,
};

export function makeSetMessageCMD(props: SetTimeCMDProps): Command {
  // interaction init
  const setMessage = makeSetMessage(props.announcementRepo);

  async function interaction(message: Message, args: Args) {
    return await setMessage({
      guildID: message.guild?.id,
      message: args.raw,
    } as any);
  }

  async function onSuccess(message: Message) {
    await message.channel.send("Message set for announcement.");
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
