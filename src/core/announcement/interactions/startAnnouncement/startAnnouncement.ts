/**
 * This file contains the use case for starting a new announcement
 */

import { IAnnouncementRepo } from "../../repos";
import { InputData, OutputData } from "./dataTransfer";
import { Announcement, GuildID } from "../../domain";
import { Response, InteractionExecute } from "../../../../lib";
import { AnnouncementError, AnnouncementInProgressError, ValidationError } from "../../errors";

export function makeStartAnnouncement(
  announcementRepo: IAnnouncementRepo,
): InteractionExecute<InputData, OutputData | AnnouncementError> {
  return async function startAnnouncement(dto: InputData) {
    const { guildID } = dto;

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

    return Response.success<OutputData>({
      guildID: newAnnouncementOrError.getValue().guildID.value,
      published: false,
    });
  };
}
