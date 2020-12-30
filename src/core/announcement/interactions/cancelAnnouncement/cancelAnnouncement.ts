/**
 * This file contains the use case for starting a new announcement
 */

import { IAnnouncementRepo } from "../../repos";
import { InputData } from "./dataTransfer";
import { GuildID } from "../../domain";
import { Response, InteractionExecute } from "../../../../lib";
import { AnnouncementError, AnnouncementNotInProgressError, ValidationError } from "../../errors";

export function makeCancelAnnouncement(
  announcementRepo: IAnnouncementRepo,
): InteractionExecute<InputData, void | AnnouncementError> {
  return async function cancelAnnouncement(input: InputData) {
    const { guildID } = input;

    const gIDOrError = GuildID.create(guildID);
    if (gIDOrError.isFailure) {
      return Response.fail<ValidationError>(new ValidationError(gIDOrError.errorValue()));
    }

    const inProgressAnnouncement = await announcementRepo.findWorkInProgressByGuildID(
      gIDOrError.getValue(),
    );
    if (!inProgressAnnouncement) {
      return Response.fail<AnnouncementNotInProgressError>(
        new AnnouncementNotInProgressError(guildID),
      );
    }

    await announcementRepo.delete(inProgressAnnouncement);

    return Response.success<void>();
  };
}
