/**
 * This file contains the interaction for setting the announcement message
 */

import { GuildID, Message } from "../domain/announcement";
import { Response, Result } from "../../../lib";
import { AnnouncementNotInProgressError, ValidationError } from "../errors";
import { AnnouncementOutput, AnnouncementToOutput, InteractionDependencies } from "./common";

export interface InputData {
  guildID: string;
  message: string;
}

export async function setMessage(
  { guildID, message }: InputData,
  { announcementRepo }: InteractionDependencies,
) {
  const guildIDOrError = GuildID.create(guildID);
  const messageOrError = Message.create(message);
  const combinedResult = Result.combine([guildIDOrError, messageOrError]);

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
  const announcementWithMessage = announcementInProgress.copy({
    message: messageOrError.getValue(),
  });

  await announcementRepo.save(announcementWithMessage);

  return Response.success<AnnouncementOutput>(AnnouncementToOutput(announcementWithMessage));
}
