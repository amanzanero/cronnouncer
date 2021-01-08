/**
 * This file contains the interaction for setting the announcement time
 */
import { GuildID, ScheduledTime } from "../domain/announcement";
import { Response, Result } from "../../../lib";
import {
  AnnouncementNotInProgressError,
  TimeInPastError,
  TimezoneNotSetError,
  ValidationError,
} from "../errors";
import { AnnouncementOutput, AnnouncementToOutput, InteractionDependencies } from "./common";

export interface InputData {
  guildID: string;
  scheduledTime: string;
}

export async function setTime(
  { guildID, scheduledTime }: InputData,
  { announcementRepo, announcementSettingsRepo, timeService }: InteractionDependencies,
) {
  const guildIDOrError = GuildID.create(guildID);
  const scheduledTimeOrError = ScheduledTime.create(scheduledTime);
  const combinedResult = Result.combine([guildIDOrError, scheduledTimeOrError]);

  if (combinedResult.isFailure) {
    return Response.fail<ValidationError>(new ValidationError(combinedResult.errorValue()));
  }

  const [settings, announcementInProgress] = await Promise.all([
    announcementSettingsRepo.getByGuildID(guildIDOrError.getValue()),
    announcementRepo.findWorkInProgressByGuildID(guildIDOrError.getValue()),
  ]);

  if (!settings || !settings.timezone) {
    return Response.fail<TimezoneNotSetError>(new TimezoneNotSetError());
  }

  if (!announcementInProgress) {
    return Response.fail<AnnouncementNotInProgressError>(
      new AnnouncementNotInProgressError(guildID),
    );
  }

  if (!timeService.isValidFutureTime(scheduledTimeOrError.getValue(), settings.timezone)) {
    return Response.fail<TimeInPastError>(new TimeInPastError());
  }

  const announcementWithTime = announcementInProgress.copy({
    scheduledTime: scheduledTimeOrError.getValue(),
  });

  await announcementRepo.save(announcementWithTime);

  return Response.success<AnnouncementOutput>(AnnouncementToOutput(announcementWithTime));
}
