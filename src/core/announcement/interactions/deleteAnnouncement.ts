/**
 * This file contains the use case for starting a new announcement
 */
import { Guard, Response } from "../../lib";
import { AnnouncementNotFoundError, ValidationError } from "../errors";
import {
  AnnouncementOutput,
  AnnouncementToOutput,
  InteractionDependencies,
  interactionLogWrapper,
} from "./common";

export interface InputData {
  announcementID: number;
  guildID: string;
}

export async function deleteAnnouncement(
  { announcementID: shortID, guildID }: InputData,
  deps: InteractionDependencies,
) {
  return await interactionLogWrapper(deps, "cancelAnnouncement", async () => {
    const { announcementRepo } = deps;
    const meta = {
      requestID: deps.requestID,
      guildID,
    };

    const guardUndefined = Guard.againstNullOrUndefinedBulk([
      { argumentName: "announcementID", argument: shortID },
      { argumentName: "guildID", argument: guildID },
    ]);
    const guardNaN = Guard.againsNaN(shortID);
    const guard = Guard.combine([guardUndefined, guardNaN]);

    if (!guard.succeeded) {
      deps.loggerService.info("deleteAnnouncement", `incorrect params: ${guard.message}`, meta);
      return Response.fail<ValidationError>(new ValidationError(guard.message));
    }

    const inProgressAnnouncement = await announcementRepo.findByShortID(shortID, guildID);
    if (!inProgressAnnouncement) {
      deps.loggerService.info("deleteAnnouncement", `announcement with id: ${shortID} DNE`, {
        ...meta,
        shortID,
      });

      return Response.fail<AnnouncementNotFoundError>(
        new AnnouncementNotFoundError(shortID.toString()),
      );
    }

    await announcementRepo.delete(inProgressAnnouncement);
    deps.loggerService.info(
      "deleteAnnouncement",
      `announcement ${inProgressAnnouncement.id} deleted on guild ${guildID}`,
      {
        ...meta,
        shortID,
        announcement: AnnouncementToOutput(inProgressAnnouncement),
      },
    );
    return Response.success<AnnouncementOutput>(AnnouncementToOutput(inProgressAnnouncement));
  });
}
