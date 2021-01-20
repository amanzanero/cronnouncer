/**
 * This file contains the use case for starting a new announcement
 */

import { Announcement } from "../domain/announcement";
import { Guard, Response } from "../../../lib";
import { TimezoneNotSetError, ValidationError } from "../errors";
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

export async function createAnnouncement({ guildID }: InputData, deps: InteractionDependencies) {
  return await interactionLogWrapper(deps, "startAnnouncement", async () => {
    // check data transfer object is valid first
    const { announcementRepo, guildSettingsRepo } = deps;

    const guard = Guard.againstNullOrUndefined(guildID, "guildID");
    if (!guard.succeeded) {
      return Response.fail<ValidationError>(new ValidationError(guard.message));
    }
    // ensure no announcement is already being made
    const guildSettings = await guildSettingsRepo.findByGuildID(guildID);

    if (!guildSettings || !guildSettings.timezone) {
      return Response.fail<TimezoneNotSetError>(new TimezoneNotSetError());
    }

    const status = Status.create(AnnouncementStatus.unscheduled).getValue();
    const newAnnouncement = Announcement.create({
      guildID,
      status: status,
    }).getValue();

    await announcementRepo.save(newAnnouncement);

    return Response.success<AnnouncementOutput>(AnnouncementToOutput(newAnnouncement));
  });
}
