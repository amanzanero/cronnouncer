/**
 * This file contains the use case for starting a new announcement
 */

import { ScheduledTime } from "../domain/announcement";
import { Guard, Response } from "../../../lib";
import {
  AnnouncementIncompleteError,
  AnnouncementNotFoundError,
  TimezoneNotSetError,
  ValidationError,
} from "../errors";
import {
  AnnouncementOutput,
  AnnouncementToOutput,
  InteractionDependencies,
  interactionLogWrapper,
} from "./common";

export interface InputData {
  announcementID: string;
  guildID: string;
}

export async function scheduleAnnouncement(
  { announcementID, guildID }: InputData,
  deps: InteractionDependencies,
) {
  return await interactionLogWrapper(deps, "scheduleAnnouncement", async () => {
    const { announcementRepo, guildSettingsRepo, cronService, timeService } = deps;

    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argumentName: "announcementID", argument: announcementID },
      { argumentName: "guildID", argument: guildID },
    ]);
    if (!guardResult.succeeded) {
      return Response.fail<ValidationError>(new ValidationError(guardResult.message));
    }

    // get in progress announcement
    const [settings, inProgressAnnouncement] = await Promise.all([
      guildSettingsRepo.findByGuildID(guildID),
      announcementRepo.findByID(announcementID),
    ]);

    if (!settings || !settings.timezone) {
      return Response.fail<TimezoneNotSetError>(new TimezoneNotSetError());
    }

    if (!inProgressAnnouncement) {
      return Response.fail<AnnouncementNotFoundError>(
        new AnnouncementNotFoundError(announcementID),
      );
    }

    const publishResult = inProgressAnnouncement.schedule({
      timeService,
      timezone: settings.timezone,
    });
    if (publishResult.isFailure) {
      return Response.fail<AnnouncementIncompleteError>(
        new AnnouncementIncompleteError(publishResult.errorValue()),
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

    return Response.success<AnnouncementOutput>(AnnouncementToOutput(inProgressAnnouncement));
  });
}
