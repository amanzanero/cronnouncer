import { Announcement } from "../domain/announcement";
import { IAnnouncementRepo, IAnnouncementSettingsRepo } from "../repos";
import { IDiscordService } from "../services/discord";
import { ICronService } from "../services/cron";
import { AnnouncementSettings } from "../domain/announcementSettings";
import { ILoggerService } from "../services/logger";
import { ITimeService } from "../services/time";
import { Response } from "../../../lib";

export interface InteractionDependencies {
  announcementRepo: IAnnouncementRepo;
  announcementSettingsRepo: IAnnouncementSettingsRepo;
  discordService: IDiscordService;
  cronService: ICronService;
  loggerService: ILoggerService;
  timeService: ITimeService;
  requestID?: string;
}

export interface AnnouncementOutput {
  id: string;
  guildID: string;
  status: string;
  channel?: string;
  message?: string;
  scheduledTime?: string;
}

export function AnnouncementToOutput(a: Announcement): AnnouncementOutput {
  const output = {
    id: a.id.value,
    guildID: a.guildID.value,
    status: a.status.value,
  };
  if (a.channel) Object.assign(output, { channel: a.channel.value });
  if (a.message) Object.assign(output, { message: a.message.value });
  if (a.scheduledTime) {
    Object.assign(output, { scheduledTime: a.scheduledTime.value });
  }
  return output;
}

export interface AnnouncementSettingsOutput {
  guildID: string;
  timezone?: string;
}

export function AnnouncementSettingsToOutput(a: AnnouncementSettings): AnnouncementSettingsOutput {
  return {
    guildID: a.guildID.value,
    timezone: a.timezone.value,
  };
}

export async function interactionLogWrapper(
  deps: { loggerService: ILoggerService; requestID?: string },
  interactionName: string,
  interaction: () => Promise<Response<any>>,
) {
  const start = Date.now();
  deps.loggerService.info(`${interactionName}>>>>`, undefined, { requestID: deps.requestID });
  const response = await interaction();
  deps.loggerService.info(`${interactionName}<<<<`, `- ${Date.now() - start}ms`, {
    requestID: deps.requestID,
  });

  return response;
}
