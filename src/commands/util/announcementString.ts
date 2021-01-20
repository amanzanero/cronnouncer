import { AnnouncementOutput } from "../../core/announcement/interactions/common";
import { baseEmbed } from "./baseEmbed";

export function announcementStringEmbed(announcementOutput: AnnouncementOutput) {
  // inside a command, event listener, etc.
  const embed = baseEmbed();
  embed.setTitle("Announcement").addFields(
    { name: "id", value: announcementOutput.id || "EMPTY" },
    {
      name: "Channel",
      value: announcementOutput.channelID ? `<#${announcementOutput.channelID}>` : "EMPTY",
      inline: true,
    },
    { name: "Time", value: announcementOutput.scheduledTime || "EMPTY", inline: true },
    { name: "Status", value: announcementOutput.status, inline: true },
    { name: "Message", value: announcementOutput.message || "EMPTY" },
  );
  return embed;
}
