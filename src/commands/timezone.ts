import { Message } from "discord.js";
import { setAnnouncementTimezone } from "../core/announcement/interactions/setAnnouncementTimezone";
import { Args } from "./definitions/Args";
import {
  AnnouncementSettingsOutput,
  InteractionDependencies,
} from "../core/announcement/interactions/common";
import { Response } from "../lib";
import { PREFIX } from "../constants";

export const help = {
  name: "timezone",
  category: "Configuration",
  description: "Sets the timezone for the discord server.",
  usage: `${PREFIX}timezone {timezone}`,
};

export const conf = {
  enabled: true,
  guildOnly: true,
};

export async function interaction(props: InteractionDependencies, message: Message, args: Args) {
  const guildID = message.guild?.id as string;
  return await setAnnouncementTimezone({ guildID, timezone: args.argArray[0] }, props);
}

export async function onSuccess(message: Message, response: Response<AnnouncementSettingsOutput>) {
  await message.channel.send(`Timezone: \`${response.value?.timezone}\` was set for the server.`);
}
