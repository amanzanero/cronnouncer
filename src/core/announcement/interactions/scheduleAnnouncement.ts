/**
 * This file contains the use case for starting a new announcement
 */

import { GuildID, ScheduledTime } from "../domain/announcement";
import { Response } from "../../../lib";
import {
  AnnouncementIncompleteError,
  AnnouncementNotInProgressError,
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
  guildID: string;
}

export async function scheduleAnnouncement({ guildID }: InputData, deps: InteractionDependencies) {
  return await interactionLogWrapper(deps, "scheduleAnnouncement", async () => {
    const { announcementRepo, announcementSettingsRepo, cronService, timeService } = deps;
    const gIDOrError = GuildID.create(guildID);
    if (gIDOrError.isFailure) {
      return Response.fail<ValidationError>(new ValidationError(gIDOrError.errorValue()));
    }

    // get in progress announcement
    const [settings, inProgressAnnouncement] = await Promise.all([
      announcementSettingsRepo.findByGuildID(gIDOrError.getValue()),
      announcementRepo.findWorkInProgressByGuildID(gIDOrError.getValue()),
    ]);

    if (!settings || !settings.timezone) {
      return Response.fail<TimezoneNotSetError>(new TimezoneNotSetError());
    }

    if (!inProgressAnnouncement) {
      return Response.fail<AnnouncementNotInProgressError>(
        new AnnouncementNotInProgressError(guildID),
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
        loggerService: deps.loggerService,
      }),
    ]);

    return Response.success<AnnouncementOutput>(AnnouncementToOutput(inProgressAnnouncement));
  });
}
