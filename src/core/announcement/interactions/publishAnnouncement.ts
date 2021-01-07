/**
 * This file contains the use case for starting a new announcement
 */

import { GuildID } from "../domain/announcement";
import { Response } from "../../../lib";
import {
  AnnouncementIncompleteError,
  AnnouncementNotInProgressError,
  ValidationError,
} from "../errors";
import { AnnouncementOutput, AnnouncementToOutput, InteractionDependencies } from "./common";

export interface InputData {
  guildID: string;
}

export async function publishAnnouncement(
  { guildID }: InputData,
  { announcementRepo, cronService, requestID }: InteractionDependencies,
) {
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
    return Response.fail<AnnouncementIncompleteError>(
      new AnnouncementIncompleteError(publishResult.errorValue()),
    );
  }

  await Promise.all([
    announcementRepo.save(inProgressAnnouncement),
    cronService.scheduleAnnouncement({
      message: inProgressAnnouncement.message?.value as string,
      channel: inProgressAnnouncement.channel?.value as string,
      guildID: inProgressAnnouncement.guildID.value,
      scheduledTime: inProgressAnnouncement.scheduledTime?.value as Date,
      requestID,
    }),
  ]);

  return Response.success<AnnouncementOutput>(AnnouncementToOutput(inProgressAnnouncement));
}
