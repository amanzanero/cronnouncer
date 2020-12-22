/**
 * This file contains the use case for starting a new announcement
 */

import { IAnnouncementRepo } from "../../repos/announcementRepo";
import { InputData, OutputData } from "./dataTransfer";
import { GuildID } from "../../domain/GuildID";
import { Response, UseCaseExecute } from "../../../../lib";
import { Announcement } from "../../domain/Announcement";
import { AnnouncementError, AnnouncementInProgressError, ValidationError } from "../../errors";

export function createStartAnnouncementUseCase(
  announcementRepo: IAnnouncementRepo,
): UseCaseExecute<InputData, OutputData | AnnouncementError> {
  return async function execute(dto: InputData) {
    const { guildID } = dto;

    // check data transfer object is valid first
    const guildIDOrError = GuildID.create(guildID);
    if (guildIDOrError.isFailure) {
      return Response.fail<ValidationError>(new ValidationError(guildIDOrError.errorValue()));
    }

    // ensure no announcement is already being made
    const announcementInProgress = await announcementRepo.findWorkInProgressByGuildId(
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
