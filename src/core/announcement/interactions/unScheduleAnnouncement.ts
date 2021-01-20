/**
 * This file contains the use case for starting a new announcement
 */
import { Guard, Response } from "../../lib";
import {
  AnnouncementLockedStatusError,
  AnnouncementNotFoundError,
  ValidationError,
} from "../errors";
import { InteractionDependencies, interactionLogWrapper } from "./common";

export interface InputData {
  announcementID: number;
  guildID: string;
}

export async function unScheduleAnnouncement(
  { announcementID: shortID, guildID }: InputData,
  deps: InteractionDependencies,
) {
  return await interactionLogWrapper(deps, "cancelAnnouncement", async () => {
    const { announcementRepo } = deps;

    const guardUndefined = Guard.againstNullOrUndefinedBulk([
      { argumentName: "announcementID", argument: shortID },
      { argumentName: "guildID", argument: guildID },
    ]);
    const guardNaN = Guard.againsNaN(shortID);
    const guardResult = Guard.combine([guardUndefined, guardNaN]);
    if (!guardResult.succeeded) {
      return Response.fail<ValidationError>(new ValidationError(guardResult.message));
    }

    const inProgressAnnouncement = await announcementRepo.findByShortID(shortID, guildID);
    if (!inProgressAnnouncement) {
      return Response.fail<AnnouncementNotFoundError>(
        new AnnouncementNotFoundError(shortID.toString()),
      );
    }

    const unScheduleResult = inProgressAnnouncement.unSchedule();
    if (unScheduleResult.isFailure) {
      return Response.fail<AnnouncementLockedStatusError>(
        new AnnouncementLockedStatusError(shortID.toString()),
      );
    }

    await announcementRepo.save(inProgressAnnouncement);

    return Response.success<void>();
  });
}
