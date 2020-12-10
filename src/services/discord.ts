import Discord from "discord.js";

export const discordService = {
  client: new Discord.Client(),
  ready: false,
};
