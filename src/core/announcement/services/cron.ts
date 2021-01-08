import schedule from "node-schedule";
import { Client, Guild, TextChannel } from "discord.js";
import { logger } from "../../../util";

export interface ScheduleAnnouncementProps {
  message: string;
  guildID: string;
  channel: string;
  scheduledTimeUTC: string;
  requestID?: string;
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

  async scheduleAnnouncement(props: ScheduleAnnouncementProps) {
    let guild: Guild;
    let channel: TextChannel;

    try {
      guild = await this.discordClient.guilds.fetch(props.guildID);
      channel = guild.channels.cache.get(props.channel) as TextChannel;
    } catch (e) {
      logger.error(e, { requestID: props.requestID });
      return;
    }

    schedule.scheduleJob(
      `${props.guildID}: ${props.scheduledTimeUTC}`,
      props.scheduledTimeUTC,
      async () => {
        try {
          await channel.send(props.message);
          logger.info(
            `[ANNOUNCEMENT] sent to channel: ${props.channel} on guild: ${props.guildID}`,
            { requestID: props.requestID },
          );
        } catch (e) {
          logger.error(e, { requestID: props.requestID });
        }
      },
    );
  }
}
