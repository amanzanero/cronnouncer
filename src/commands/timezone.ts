import { Message } from "discord.js";
import { setGuildTimezone } from "../core/announcement/interactions/setGuildTimezone";
import { Args } from "./definitions/Args";
import {
  GuildSettingsOutput,
  InteractionDependencies,
} from "../core/announcement/interactions/common";
import { Response } from "../lib";
import { PREFIX, SUPPORTED_TIMEZONES } from "../constants";

export const help = {
  name: "timezone",
  category: "Configuration",
  description: `Sets the timezone for the discord server (you only have to do this once). Available timezones (case sensitive): ${SUPPORTED_TIMEZONES.map(
    (zone) => `\`${zone}\``,
  ).join(", ")}`,
  usage: `${PREFIX}timezone {timezone}`,
  example: `${PREFIX}timezone US/Pacific`,
};

export const conf = {
  enabled: true,
  guildOnly: true,
};

export async function interaction(props: InteractionDependencies, message: Message, args: Args) {
  const guildID = message.guild?.id as string;
  return await setGuildTimezone({ guildID, timezone: args.argArray[0] }, props);
}

export async function onSuccess(message: Message, response: Response<GuildSettingsOutput>) {
  await message.channel.send(`Timezone: \`${response.value?.timezone}\` was set for the server.`);
}
