import Discord from "discord.js";

export function baseEmbed() {
  // inside a command, event listener, etc.
  return new Discord.MessageEmbed()
    .setColor("#fd0061")
    .setAuthor("Cronnouncer", "https://i.imgur.com/wSTFkRM.png");
}
