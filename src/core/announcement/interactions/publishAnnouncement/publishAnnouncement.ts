/**
 * This file contains the use case for starting a new announcement
 */

import { IAnnouncementRepo } from "../../repos";
import { InputData } from "./dataTransfer";
import { GuildID } from "../../domain";
import { Response, InteractionExecute } from "../../../../lib";
import {
  AnnouncementError,
  AnnouncementIncompleteError,
  AnnouncementNotInProgressError,
  ValidationError,
} from "../../errors";
import { AnnouncementOutput, AnnouncementToOutput } from "../common";

export function makePublishAnnouncement(
  announcementRepo: IAnnouncementRepo,
): InteractionExecute<InputData, AnnouncementOutput | AnnouncementError> {
  return async function publishAnnouncement(input: InputData) {
    const { guildID } = input;

    const gIDOrError = GuildID.create(guildID);
    if (gIDOrError.isFailure) {
      return Response.fail<ValidationError>(new ValidationError(gIDOrError.errorValue()));
    }

    // get in progress announcement
    const inProgressAnnouncement = await announcementRepo.findWorkInProgressByGuildID(
      gIDOrError.getValue(),
    );
    if (!inProgressAnnouncement) {
      return Response.fail<AnnouncementNotInProgressError>(
        new AnnouncementNotInProgressError(guildID),
      );
    }

    const publishResult = inProgressAnnouncement.publish();
    if (publishResult.isFailure) {
      return Response.fail<AnnouncementIncompleteError>(new AnnouncementIncompleteError());
    }

    return Response.success<AnnouncementOutput>(AnnouncementToOutput(inProgressAnnouncement));
  };
}
