/**
 * This file contains the use case for starting a new announcement
 */
import { GuildID } from "../domain/announcement";
import { Response } from "../../../lib";
import { AnnouncementNotInProgressError, ValidationError } from "../errors";
import { InteractionDependencies, interactionLogWrapper } from "./common";

export interface InputData {
  guildID: string;
}

export async function cancelAnnouncement({ guildID }: InputData, deps: InteractionDependencies) {
  return await interactionLogWrapper(deps, "cancelAnnouncement", async () => {
    const { announcementRepo } = deps;
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
  });
}
