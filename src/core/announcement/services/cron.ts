import schedule from "node-schedule";
import { Client, Guild, TextChannel } from "discord.js";
import { logger } from "../../../util";
import { Announcement, Channel, GuildID, Message } from "../domain/announcement";

export interface ScheduleAnnouncementProps {
  message: Message;
  guildID: GuildID;
  channel: Channel;
  scheduledTimeUTC: string;
}

export const DATE_FORMAT = "M/D/YYYY h:mm a";

export interface ICronService {
  scheduleAnnouncement(announcement: Announcement, scheduledTimeUTC: string): Promise<void>;
}

export class CronService implements ICronService {
  private discordClient: Client;

  constructor(discordClient: Client) {
    this.discordClient = discordClient;
  }

  async scheduleAnnouncement(announcement: Announcement, scheduledTimeUTC: string): Promise<void> {
    let guild: Guild;
    let channel: TextChannel;

    try {
      guild = await this.discordClient.guilds.fetch(announcement.guildID.value);
      channel = guild.channels.cache.get((announcement.channel as Channel).value) as TextChannel;
    } catch (e) {
      logger.error(e);
      return;
    }

    schedule.scheduleJob(`${announcement.id}`, scheduledTimeUTC, async () => {
      try {
        await channel.send((announcement.message as Message).value);
        logger.info(
          `[ANNOUNCEMENT] channel: ${channel.name} (${
            (announcement.channel as Channel).value
          }) guild: ${guild.name} (${announcement.guildID.value}) announcement: ${
            announcement.id.value
          }`,
        );
      } catch (e) {
        logger.error(`[ANNOUNCEMENT] announcement: ${announcement.id.value} ${e.stack}`);
      }
    });
  }
}
