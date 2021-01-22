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
  return await interactionLogWrapper(deps, "unScheduleAnnouncement", async () => {
    const { announcementRepo, meta } = deps;

    const guardUndefined = Guard.againstNullOrUndefinedBulk([
      { argumentName: "announcementID", argument: shortID },
      { argumentName: "guildID", argument: guildID },
    ]);
    const guardNaN = Guard.againstNaN(shortID, "shortID");
    const guardResult = Guard.combine([guardUndefined, guardNaN]);
    if (!guardResult.succeeded) {
      deps.loggerService.info(
        "unScheduleAnnouncement",
        `incorrectParams: ${guardResult.message}`,
        meta,
      );
      return Response.fail<ValidationError>(new ValidationError(guardResult.message));
    }

    const inProgressAnnouncement = await announcementRepo.findByShortID(shortID, guildID);
    if (!inProgressAnnouncement) {
      deps.loggerService.info(
        "unScheduleAnnouncement",
        `announcement: ${shortID} DNE - no action taken`,
        meta,
      );
      return Response.fail<AnnouncementNotFoundError>(
        new AnnouncementNotFoundError(shortID.toString()),
      );
    }

    const unScheduleResult = inProgressAnnouncement.unSchedule();
    if (unScheduleResult.isFailure) {
      const e = new AnnouncementLockedStatusError(shortID.toString());
      deps.loggerService.info("unScheduleAnnouncement", `${e.message} - no action taken`, meta);
      return Response.fail<AnnouncementLockedStatusError>(e);
    }
    deps.cronService.unScheduleAnnouncement({
      announcement: inProgressAnnouncement,
      loggerService: deps.loggerService,
      requestID: deps.meta.requestID,
    });
    await announcementRepo.save(inProgressAnnouncement);

    return Response.success<void>();
  });
}
