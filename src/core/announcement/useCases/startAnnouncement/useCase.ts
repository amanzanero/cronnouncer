/**
 * This file contains the use case for starting a new announcement
 */

import { IAnnouncementRepo } from "../../repos/announcementRepo";
import { InputData, OutputData } from "./dataTransfer";
import { GuildID } from "../../domain/GuildID";
import { SenderID } from "../../domain/SenderID";
import { Result, Response, UseCaseExecute } from "../../../../lib";
import { Announcement } from "../../domain/Announcement";
import { AnnouncementInProgressError, UnexpectedError, ValidationError } from "../../errors";

export function createStartAnnouncementUseCase(
  announcementRepo: IAnnouncementRepo,
): UseCaseExecute<InputData, OutputData | Error> {
  return async function execute(dto: InputData) {
    const { guildId, senderId } = dto;

    // check data transfer object is valid first
    const guildIDOrError = GuildID.create(guildId);
    const senderIDOrError = SenderID.create(senderId);
    const combinedErrors = Result.combine([guildIDOrError, senderIDOrError]);
    if (combinedErrors.isFailure) {
      return Response.fail<ValidationError>(new ValidationError(combinedErrors.errorValue()));
    }

    // ensure no announcement is already being made
    let announcementInProgress: Announcement | undefined;
    try {
      announcementInProgress = await announcementRepo.findWorkInProgressByGuildId(
        guildIDOrError.getValue(),
      );
    } catch (e) {
      return Response.fail<UnexpectedError>(e);
    }

    if (announcementInProgress) {
      return Response.fail<AnnouncementInProgressError>(new AnnouncementInProgressError(guildId));
    }

    // good to create on from here
    const newAnnouncementOrError = Announcement.create({
      guildId: guildIDOrError.getValue(),
      senderId: senderIDOrError.getValue(),
      published: false,
    });

    await announcementRepo.save(newAnnouncementOrError.getValue());

    return Response.success<OutputData>({
      guildId: newAnnouncementOrError.getValue().guildId.value,
      senderId: newAnnouncementOrError.getValue().senderId.value,
      published: false,
    });
  };
}
