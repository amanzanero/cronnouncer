import schedule from "node-schedule";
import { Client, Guild, TextChannel } from "discord.js";
import { Announcement, Message } from "../domain/announcement";
import { IAnnouncementRepo } from "../repos";
import { ILoggerService } from "./logger";

export interface ScheduleAnnouncementProps {
  announcement: Announcement;
  scheduledTimeUTC: string;

  announcementRepo: IAnnouncementRepo;
  loggerService: ILoggerService;
  requestID?: string;
}

export interface UnScheduleAnnouncemntProps {
  announcement: Announcement;
  loggerService: ILoggerService;
  requestID?: string;
}

export const DATE_FORMAT = "M/D/YYYY h:mm a";

export interface ICronService {
  scheduleAnnouncement(props: ScheduleAnnouncementProps): Promise<void>;

  unScheduleAnnouncement(props: UnScheduleAnnouncemntProps): Promise<void>;
}

export class CronService implements ICronService {
  private discordClient: Client;

  constructor(discordClient: Client) {
    this.discordClient = discordClient;
  }

  async scheduleAnnouncement(props: ScheduleAnnouncementProps): Promise<void> {
    const { announcement, scheduledTimeUTC, announcementRepo, loggerService, requestID } = props;

    let guild: Guild;
    let channel: TextChannel;

    try {
      guild = await this.discordClient.guilds.fetch(announcement.guildID);
      channel = guild.channels.cache.get(announcement.channelID as string) as TextChannel;
    } catch (e) {
      loggerService.error("CronService.scheduleAnnouncement", e);
      return;
    }

    schedule.scheduleJob(`${announcement.id}`, scheduledTimeUTC, async () => {
      try {
        await channel.send((announcement.message as Message).value);
        announcement.sent();
        await announcementRepo.save(announcement);

        loggerService.info(
          "CronService.scheduleAnnouncement",
          `announcement sent to channel #${channel.name} on guild: ${guild.name}`,
          {
            requestID,
            guildID: guild.id,
            channelID: channel.id,
            announcementID: announcement.id.value,
          },
        );
      } catch (e) {
        loggerService.error(e, {
          requestID,
          guildID: guild.id,
          channelID: channel.id,
          announcementID: announcement.id.value,
        });
      }
    });
  }

  async unScheduleAnnouncement(props: UnScheduleAnnouncemntProps): Promise<void> {
    const { announcement, loggerService, requestID } = props;

    schedule.cancelJob(`${announcement.id}`);
    loggerService.info(
      "CronService.unScheduleAnnouncement",
      `unscheduled announcement: ${announcement.id}`,
      {
        requestID,
        guildID: announcement.guildID,
        channelID: announcement.channelID,
        announcementID: announcement.id.value,
      },
    );
  }
}
