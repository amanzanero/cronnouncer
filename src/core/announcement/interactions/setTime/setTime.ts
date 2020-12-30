/**
 * This file contains the interaction for setting the announcement time
 */

import { IAnnouncementRepo } from "../../repos";
import { InputData } from "./dataTransfer";
import { GuildID, ScheduledTime } from "../../domain";
import { Response, Result, InteractionExecute } from "../../../../lib";
import { AnnouncementError, AnnouncementNotInProgressError, ValidationError } from "../../errors";
import { AnnouncementOutput, AnnouncementToOutput } from "../common";

export function makeSetTime(
  announcementRepo: IAnnouncementRepo,
): InteractionExecute<InputData, AnnouncementOutput | AnnouncementError> {
  return async function setTime(input: InputData) {
    const { guildID, scheduledTime } = input;

    const guildIDOrError = GuildID.create(guildID);
    const scheduledTimeOrError = ScheduledTime.create(scheduledTime);
    const combinedResult = Result.combine([guildIDOrError, scheduledTimeOrError]);

    if (combinedResult.isFailure) {
      return Response.fail<ValidationError>(new ValidationError(combinedResult.errorValue()));
    }

    // get existing announcement
    const announcementInProgress = await announcementRepo.findWorkInProgressByGuildId(
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
  };
}
