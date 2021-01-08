/**
 * This file contains the use case for starting a new announcement
 */

import { GuildID } from "../domain/announcement";
import { Response } from "../../../lib";
import {
  AnnouncementIncompleteError,
  AnnouncementNotInProgressError,
  TimezoneNotSetError,
  ValidationError,
} from "../errors";
import { AnnouncementOutput, AnnouncementToOutput, InteractionDependencies } from "./common";

export interface InputData {
  guildID: string;
}

export async function publishAnnouncement(
  { guildID }: InputData,
  {
    announcementRepo,
    announcementSettingsRepo,
    cronService,
    timeService,
    requestID,
  }: InteractionDependencies,
) {
  const gIDOrError = GuildID.create(guildID);
  if (gIDOrError.isFailure) {
    return Response.fail<ValidationError>(new ValidationError(gIDOrError.errorValue()));
  }

  // get in progress announcement
  const [settings, inProgressAnnouncement] = await Promise.all([
    announcementSettingsRepo.getByGuildID(gIDOrError.getValue()),
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

  const publishResult = inProgressAnnouncement.publish({
    timeService,
    timezone: settings.timezone,
  });

  if (publishResult.isFailure) {
    return Response.fail<AnnouncementIncompleteError>(
      new AnnouncementIncompleteError(publishResult.errorValue()),
    );
  }

  await Promise.all([
    announcementRepo.save(inProgressAnnouncement),
    cronService.scheduleAnnouncement({
      message: inProgressAnnouncement.message?.value as string,
      channel: inProgressAnnouncement.channel?.value as string,
      guildID: inProgressAnnouncement.guildID.value,
      scheduledTimeUTC: inProgressAnnouncement.scheduledTime?.value as string,
      requestID,
    }),
  ]);

  return Response.success<AnnouncementOutput>(AnnouncementToOutput(inProgressAnnouncement));
}
