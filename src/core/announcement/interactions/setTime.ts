/**
 * This file contains the interaction for setting the announcement time
 */

import { GuildID, ScheduledTime } from "../domain";
import { Response, Result } from "../../../lib";
import { AnnouncementNotInProgressError, ValidationError } from "../errors";
import { AnnouncementOutput, AnnouncementToOutput, InteractionDependencies } from "./common";

export interface InputData {
  guildID: string;
  scheduledTime: string;
}

export async function setTime(
  { guildID, scheduledTime }: InputData,
  { announcementRepo }: InteractionDependencies,
) {
  const guildIDOrError = GuildID.create(guildID);
  const scheduledTimeOrError = ScheduledTime.create(scheduledTime);
  const combinedResult = Result.combine([guildIDOrError, scheduledTimeOrError]);

  if (combinedResult.isFailure) {
    return Response.fail<ValidationError>(new ValidationError(combinedResult.errorValue()));
  }

  // get existing announcement
  const announcementInProgress = await announcementRepo.findWorkInProgressByGuildID(
    guildIDOrError.getValue(),
  );

  if (!announcementInProgress) {
    return Response.fail<AnnouncementNotInProgressError>(
      new AnnouncementNotInProgressError(guildID),
    );
  }

  // set a time
  const announcementWithTime = announcementInProgress.copy({
    scheduledTime: scheduledTimeOrError.getValue(),
  });

  await announcementRepo.save(announcementWithTime);

  return Response.success<AnnouncementOutput>(AnnouncementToOutput(announcementWithTime));
}
