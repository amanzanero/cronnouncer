/**
 * This file contains the use case for starting a new announcement
 */

import { IAnnouncementRepo } from "../../repos/announcementRepo";
import { AnnouncementToOutput, InputData, OutputData } from "./dataTransfer";
import { GuildID } from "../../domain";
import { Response, UseCaseExecute } from "../../../../lib";
import {
  AnnouncementError,
  AnnouncementIncompleteError,
  AnnouncementNotInProgressError,
  ValidationError,
} from "../../errors";

export function createPublishAnnouncementUseCase(
  announcementRepo: IAnnouncementRepo,
): UseCaseExecute<InputData, OutputData | AnnouncementError> {
  return async function execute(input: InputData) {
    const { guildID } = input;

    const gIDOrError = GuildID.create(guildID);
    if (gIDOrError.isFailure) {
      return Response.fail<ValidationError>(new ValidationError(gIDOrError.errorValue()));
    }

    // get in progress announcement
    const inProgressAnnouncement = await announcementRepo.findWorkInProgressByGuildId(
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

    return Response.success<OutputData>(AnnouncementToOutput(inProgressAnnouncement));
  };
}
