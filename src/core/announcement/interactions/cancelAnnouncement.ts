/**
 * This file contains the use case for starting a new announcement
 */
import { GuildID } from "../domain";
import { Response } from "../../../lib";
import { AnnouncementNotInProgressError, ValidationError } from "../errors";
import { InteractionDependencies } from "./common";

export interface InputData {
  guildID: string;
}

export async function cancelAnnouncement(
  { guildID }: InputData,
  { announcementRepo }: InteractionDependencies,
) {
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
}
