import { Announcement } from "../domain/announcement";
import { IAnnouncementRepo, IGuildSettingsRepo } from "../repos";
import { IDiscordService } from "../services/discord";
import { ICronService } from "../services/cron";
import { GuildSettings } from "../domain/guildSettings";
import { ILoggerService } from "../services/logger";
import { ITimeService } from "../services/time";
import { Response } from "../../lib";
import { IIdentifierService } from "../services/identifierService";

export interface InteractionDependencies {
  announcementRepo: IAnnouncementRepo;
  guildSettingsRepo: IGuildSettingsRepo;
  discordService: IDiscordService;
  cronService: ICronService;
  loggerService: ILoggerService;
  timeService: ITimeService;
  identifierService: IIdentifierService;
  requestID?: string;
}

export interface AnnouncementOutput {
  id: number;
  guildID: string;
  status: string;
  channelID?: string;
  message?: string;
  scheduledTime?: string;
}

export function AnnouncementToOutput(a: Announcement): AnnouncementOutput {
  const output = {
    id: a.shortID,
    guildID: a.guildID,
    status: a.status.value,
  };
  if (a.channelID) Object.assign(output, { channelID: a.channelID });
  if (a.message) Object.assign(output, { message: a.message.value });
  if (a.scheduledTime) {
    Object.assign(output, { scheduledTime: a.scheduledTime.value });
  }
  return output;
}

export interface GuildSettingsOutput {
  guildID: string;
  timezone?: string;
}

export function GuildSettingsToOutput(gs: GuildSettings): GuildSettingsOutput {
  return {
    guildID: gs.guildID,
    timezone: gs.timezone?.value,
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
