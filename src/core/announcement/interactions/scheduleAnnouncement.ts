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
import { AnnouncementOutput, AnnouncementToOutput, InteractionDependencies } from "./common";

export interface InputData {
  guildID: string;
}

export async function scheduleAnnouncement(
  { guildID }: InputData,
  { announcementRepo, announcementSettingsRepo, cronService, timeService }: InteractionDependencies,
) {
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

  const message = inProgressAnnouncement.message as Message;
  const channel = inProgressAnnouncement.channel as Channel;

  const scheduledTimeUTC = timeService.scheduleTimeToUTC(
    inProgressAnnouncement.scheduledTime as ScheduledTime,
    settings.timezone,
  );
  await Promise.all([
    announcementRepo.save(inProgressAnnouncement),
    cronService.scheduleAnnouncement({
      message: message.value as string,
      channel: channel.value as string,
      guildID: inProgressAnnouncement.guildID.value,
      scheduledTimeUTC,
      requestID,
    }),
  ]);

  return Response.success<AnnouncementOutput>(AnnouncementToOutput(inProgressAnnouncement));
}
