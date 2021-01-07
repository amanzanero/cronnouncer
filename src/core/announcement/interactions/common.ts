import moment from "moment-timezone";
import { Announcement, DATE_FORMAT } from "../domain/announcement";
import { IAnnouncementRepo, IAnnouncementSettingsRepo } from "../repos";
import { IDiscordService } from "../services/discord";
import { ICronService } from "../services/cron";
import { AnnouncementSettings } from "../domain/announcementSettings";

export interface InteractionDependencies {
  announcementRepo: IAnnouncementRepo;
  announcementSettingsRepo: IAnnouncementSettingsRepo;
  discordService: IDiscordService;
  cronService: ICronService;
  requestID: string;
}

export interface AnnouncementOutput {
  guildID: string;
  published: boolean;
  channel?: string;
  message?: string;
  scheduledTime?: string;
}

export function AnnouncementToOutput(a: Announcement): AnnouncementOutput {
  const output = {
    guildID: a.guildID.value,
    published: a.published,
  };
  if (a.channel) Object.assign(output, { channel: a.channel.value });
  if (a.message) Object.assign(output, { message: a.message.value });
  if (a.scheduledTime) {
    Object.assign(output, { scheduledTime: moment(a.scheduledTime.value).format(DATE_FORMAT) });
  }
  return output;
}

export interface AnnouncementSettingsOutput {
  guildID: string;
  timezone?: string;
}

export function AnnouncementSettingsToOutput(a: AnnouncementSettings): AnnouncementSettingsOutput {
  const output = {
    guildID: a.guildID.value,
  };
  if (a.timezone) Object.assign(output, { timezone: a.timezone.value });

  return output;
}
