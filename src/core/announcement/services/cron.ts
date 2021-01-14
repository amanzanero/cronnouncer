import schedule from "node-schedule";
import { Client, Guild, TextChannel } from "discord.js";
import { Announcement, Channel, Message } from "../domain/announcement";
import { ILoggerService } from "./logger";

export interface ScheduleAnnouncementProps {
  announcement: Announcement;
  scheduledTimeUTC: string;

  loggerService: ILoggerService;
}

export const DATE_FORMAT = "M/D/YYYY h:mm a";

export interface ICronService {
  scheduleAnnouncement(props: ScheduleAnnouncementProps): Promise<void>;
}

export class CronService implements ICronService {
  private discordClient: Client;

  constructor(discordClient: Client) {
    this.discordClient = discordClient;
  }

  async scheduleAnnouncement(props: ScheduleAnnouncementProps): Promise<void> {
    const { announcement, scheduledTimeUTC, loggerService } = props;

    let guild: Guild;
    let channel: TextChannel;

    try {
      guild = await this.discordClient.guilds.fetch(announcement.guildID.value);
      channel = guild.channels.cache.get((announcement.channel as Channel).value) as TextChannel;
    } catch (e) {
      loggerService.error("CronService.scheduleAnnouncement", e);
      return;
    }

    schedule.scheduleJob(`${announcement.id}`, scheduledTimeUTC, async () => {
      try {
        await channel.send((announcement.message as Message).value);
        loggerService.info(
          "CronService.scheduleAnnouncement",
          `[ANNOUNCEMENT] channel: ${channel.name} (${
            (announcement.channel as Channel).value
          }) guild: ${guild.name} (${announcement.guildID.value}) announcement: ${
            announcement.id.value
          }`,
        );
      } catch (e) {
        loggerService.error(
          "CronService.scheduleAnnouncement",
          `[ANNOUNCEMENT] announcement: ${announcement.id.value} ${e.stack}`,
        );
      }
    });
  }
}
