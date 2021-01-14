/**
 * This file contains the use case for starting a new announcement
 */

import { Announcement, GuildID } from "../domain/announcement";
import { Response } from "../../../lib";
import { AnnouncementInProgressError, TimezoneNotSetError, ValidationError } from "../errors";
import {
  AnnouncementOutput,
  AnnouncementToOutput,
  InteractionDependencies,
  interactionLogWrapper,
} from "./common";
import { AnnouncementStatus, Status } from "../domain/announcement/Status";

export interface InputData {
  guildID: string;
}

export async function startAnnouncement({ guildID }: InputData, deps: InteractionDependencies) {
  return await interactionLogWrapper(deps, "startAnnouncement", async () => {
    // check data transfer object is valid first
    const { announcementRepo, announcementSettingsRepo } = deps;
    const guildIDOrError = GuildID.create(guildID);
    if (guildIDOrError.isFailure) {
      return Response.fail<ValidationError>(new ValidationError(guildIDOrError.errorValue()));
    }
    const gID = guildIDOrError.getValue();

    // ensure no announcement is already being made
    const [announcementInProgress, announcementSettings] = await Promise.all([
      announcementRepo.findWorkInProgressByGuildID(gID),
      announcementSettingsRepo.findByGuildID(gID),
    ]);

    if (announcementInProgress) {
      return Response.fail<AnnouncementInProgressError>(new AnnouncementInProgressError(guildID));
    }

    if (!announcementSettings || !announcementSettings.timezone) {
      return Response.fail<TimezoneNotSetError>(new TimezoneNotSetError());
    }

    const status = Status.create(AnnouncementStatus.active).getValue();
    const newAnnouncement = Announcement.create({
      guildID: gID,
      status: status,
    }).getValue();

    await announcementRepo.save(newAnnouncement);

    return Response.success<AnnouncementOutput>(AnnouncementToOutput(newAnnouncement));
  });
}
