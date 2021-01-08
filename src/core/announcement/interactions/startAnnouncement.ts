/**
 * This file contains the use case for starting a new announcement
 */

import { Announcement, GuildID } from "../domain/announcement";
import { Response } from "../../../lib";
import { AnnouncementInProgressError, TimezoneNotSetError, ValidationError } from "../errors";
import { AnnouncementOutput, InteractionDependencies } from "./common";

export interface InputData {
  guildID: string;
}

export async function startAnnouncement(
  { guildID }: InputData,
  { announcementRepo, announcementSettingsRepo }: InteractionDependencies,
) {
  // check data transfer object is valid first
  const guildIDOrError = GuildID.create(guildID);
  if (guildIDOrError.isFailure) {
    return Response.fail<ValidationError>(new ValidationError(guildIDOrError.errorValue()));
  }

  // ensure no announcement is already being made
  const [announcementInProgress, announcementSettings] = await Promise.all([
    announcementRepo.findWorkInProgressByGuildID(guildIDOrError.getValue()),
    announcementSettingsRepo.getByGuildID(guildIDOrError.getValue()),
  ]);

  if (announcementInProgress) {
    return Response.fail<AnnouncementInProgressError>(new AnnouncementInProgressError(guildID));
  }

  if (!announcementSettings || !announcementSettings.timezone) {
    return Response.fail<TimezoneNotSetError>(new TimezoneNotSetError());
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
