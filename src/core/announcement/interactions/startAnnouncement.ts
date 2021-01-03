/**
 * This file contains the use case for starting a new announcement
 */

import { IAnnouncementRepo } from "../repos";
import { Announcement, GuildID } from "../domain";
import { Response } from "../../../lib";
import { AnnouncementInProgressError, ValidationError } from "../errors";
import { AnnouncementOutput } from "./common";

export interface InputData {
  guildID: string;
}

export interface Dependencies {
  announcementRepo: IAnnouncementRepo;
}

export async function startAnnouncement(
  { guildID }: InputData,
  { announcementRepo }: Dependencies,
) {
  // check data transfer object is valid first
  const guildIDOrError = GuildID.create(guildID);
  if (guildIDOrError.isFailure) {
    return Response.fail<ValidationError>(new ValidationError(guildIDOrError.errorValue()));
  }

  // ensure no announcement is already being made
  const announcementInProgress = await announcementRepo.findWorkInProgressByGuildID(
    guildIDOrError.getValue(),
  );

  if (announcementInProgress) {
    return Response.fail<AnnouncementInProgressError>(new AnnouncementInProgressError(guildID));
  }

  // good to create on from here
  const newAnnouncementOrError = Announcement.create({
    guildID: guildIDOrError.getValue(),
    published: false,
  });

  await announcementRepo.save(newAnnouncementOrError.getValue());

  return Response.success<AnnouncementOutput>({
    guildID: newAnnouncementOrError.getValue().guildID.value,
    published: false,
  });
}
