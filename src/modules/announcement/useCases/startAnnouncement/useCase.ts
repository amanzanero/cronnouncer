/**
 * This file contains the use case for starting a new announcement
 */

import { IAnnouncementRepo } from "../../repos/announcementRepo";
import { InputDTO } from "./inputDTO";
import { GuildId } from "../../domain/guildId";
import { SenderId } from "../../domain/senderId";
import { Result, Response, UseCaseExecute } from "../../../../lib";
import { Announcement } from "../../domain/announcement";
import { Message } from "../../domain/message";
import { ScheduledTime } from "../../domain/scheduledTime";
import { OutputDTO } from "./outputDTO";

export function createStartAnnouncementUseCase(
  announcementRepo: IAnnouncementRepo,
): UseCaseExecute<InputDTO, OutputDTO> {
  return async function execute(dto: InputDTO) {
    const { guildId, senderId } = dto;

    // check data transfer object is valid first
    const guildIDOrError = GuildId.create(guildId);
    const senderIDOrError = SenderId.create(senderId);
    const combinedErrors = Result.combine([guildIDOrError, senderIDOrError]);
    if (combinedErrors.isFailure) {
      return Response.fail<OutputDTO>(combinedErrors.errorValue());
    }
    const scheduledTime = ScheduledTime.create();
    const message = Message.create();

    // ensure no announcement is already being made
    const announcementInProgress = await announcementRepo.findWorkInProgressByGuildId(
      guildIDOrError.getValue(),
    );
    if (announcementInProgress) {
      return Response.fail<OutputDTO>("There is an unfinished announcement for this guild.");
    }

    // good to create on from here
    const newAnnouncementOrError = Announcement.create({
      message: message.getValue(),
      scheduledTime: scheduledTime.getValue(),
      guildId: guildIDOrError.getValue(),
      senderId: senderIDOrError.getValue(),
      published: false,
    });

    await announcementRepo.save(newAnnouncementOrError.getValue());

    return Response.success<OutputDTO>({
      guildId: newAnnouncementOrError.getValue().guildId.value,
      senderId: newAnnouncementOrError.getValue().senderId.value,
      published: false,
    });
  };
}
