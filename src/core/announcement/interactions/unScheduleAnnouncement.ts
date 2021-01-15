/**
 * This file contains the use case for starting a new announcement
 */
import { Response } from "../../../lib";
import {
  AnnouncementLockedStatusError,
  AnnouncementNotFoundError,
  ValidationError,
} from "../errors";
import { InteractionDependencies, interactionLogWrapper } from "./common";

export interface InputData {
  announcementID: string;
}

export async function unScheduleAnnouncement(
  { announcementID }: InputData,
  deps: InteractionDependencies,
) {
  return await interactionLogWrapper(deps, "cancelAnnouncement", async () => {
    const { announcementRepo } = deps;

    if (!announcementID) {
      return Response.fail<ValidationError>(
        new ValidationError("No announcement id was provided."),
      );
    }

    const inProgressAnnouncement = await announcementRepo.findByID(announcementID);
    if (!inProgressAnnouncement) {
      return Response.fail<AnnouncementNotFoundError>(
        new AnnouncementNotFoundError(announcementID),
      );
    }

    const unScheduleResult = inProgressAnnouncement.unSchedule();
    if (unScheduleResult.isFailure) {
      return Response.fail<AnnouncementLockedStatusError>(
        new AnnouncementLockedStatusError(announcementID),
      );
    }

    await announcementRepo.save(inProgressAnnouncement);

    return Response.success<void>();
  });
}
