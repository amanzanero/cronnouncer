/**
 * This file contains the use case for starting a new announcement
 */

import { ScheduledTime } from "../domain/announcement";
import { Guard, Response } from "../../lib";
import {
  AnnouncementIncompleteError,
  AnnouncementNotFoundError,
  TimezoneNotSetError,
  ValidationError,
} from "../errors";
import {
  AnnouncementOutput,
  AnnouncementToOutput,
  GuildSettingsToOutput,
  InteractionDependencies,
  interactionLogWrapper,
} from "./common";

export interface InputData {
  announcementID: number;
  guildID: string;
}

export async function scheduleAnnouncement(
  { announcementID: shortID, guildID }: InputData,
  deps: InteractionDependencies,
) {
  return await interactionLogWrapper(deps, "scheduleAnnouncement", async () => {
    const { announcementRepo, guildSettingsRepo, cronService, timeService } = deps;
    const meta = { requestID: deps.requestID, shortID };

    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argumentName: "announcementID", argument: shortID },
      { argumentName: "guildID", argument: guildID },
    ]);
    if (!guardResult.succeeded) {
      deps.loggerService.info("scheduleAnnouncement", `validation: ${guardResult.message}`, meta);
      return Response.fail<ValidationError>(new ValidationError(guardResult.message));
    }

    // get in progress announcement
    const [settings, inProgressAnnouncement] = await Promise.all([
      guildSettingsRepo.findByGuildID(guildID),
      announcementRepo.findByShortID(shortID, guildID),
    ]);

    if (!settings || !settings.timezone) {
      deps.loggerService.info(
        "scheduleAnnouncement",
        "validation: no guild settings or timezone",
        meta,
      );
      return Response.fail<TimezoneNotSetError>(new TimezoneNotSetError());
    }

    if (!inProgressAnnouncement) {
      deps.loggerService.info("scheduleAnnouncement", `announcement with id: ${shortID} DNE`, meta);
      return Response.fail<AnnouncementNotFoundError>(
        new AnnouncementNotFoundError(shortID.toString()),
      );
    }

    const updatedMeta = {
      ...meta,
      announcement: AnnouncementToOutput(inProgressAnnouncement),
      guildSettings: GuildSettingsToOutput(settings),
    };
    const scheduleResult = inProgressAnnouncement.schedule({
      timeService,
      timezone: settings.timezone,
    });
    if (scheduleResult.isFailure) {
      deps.loggerService.info(
        "scheduleAnnouncement",
        "did not schedule: announcement was incomplete",
        updatedMeta,
      );
      return Response.fail<AnnouncementIncompleteError>(
        new AnnouncementIncompleteError(scheduleResult.errorValue()),
      );
    }

    const scheduledTimeUTC = timeService.scheduleTimeToUTC(
      inProgressAnnouncement.scheduledTime as ScheduledTime,
      settings.timezone,
    );
    await Promise.all([
      announcementRepo.save(inProgressAnnouncement),
      cronService.scheduleAnnouncement({
        announcement: inProgressAnnouncement,
        scheduledTimeUTC,
        announcementRepo,
        loggerService: deps.loggerService,
      }),
    ]);

    deps.loggerService.info(
      "scheduleAnnouncement",
      `successfully scheduled announcement: ${inProgressAnnouncement.id.value}`,
      {
        ...updatedMeta,
        announcement: AnnouncementToOutput(inProgressAnnouncement),
      },
    );
    return Response.success<AnnouncementOutput>(AnnouncementToOutput(inProgressAnnouncement));
  });
}
