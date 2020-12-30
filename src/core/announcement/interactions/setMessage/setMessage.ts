/**
 * This file contains the interaction for setting the announcement message
 */

import { IAnnouncementRepo } from "../../repos";
import { InputData } from "./dataTransfer";
import { GuildID, Message } from "../../domain";
import { Response, Result, InteractionExecute } from "../../../../lib";
import { AnnouncementError, AnnouncementNotInProgressError, ValidationError } from "../../errors";
import { AnnouncementOutput, AnnouncementToOutput } from "../common";

export function makeSetMessage(
  announcementRepo: IAnnouncementRepo,
): InteractionExecute<InputData, AnnouncementOutput | AnnouncementError> {
  return async function setMessage(input: InputData) {
    const { guildID, message } = input;

    const guildIDOrError = GuildID.create(guildID);
    const messageOrError = Message.create(message);
    const combinedResult = Result.combine([guildIDOrError, messageOrError]);

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
    const announcementWithMessage = announcementInProgress.copy({
      message: messageOrError.getValue(),
    });

    await announcementRepo.save(announcementWithMessage);

    return Response.success<AnnouncementOutput>(AnnouncementToOutput(announcementWithMessage));
  };
}
