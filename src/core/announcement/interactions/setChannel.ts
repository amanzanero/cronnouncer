/**
 * This file contains the interaction for setting the announcement channel
 */

import { Channel, GuildID } from "../domain/announcement";
import { Response, Result } from "../../../lib";
import {
  AnnouncementNotInProgressError,
  TextChannelDoesNotExistError,
  ValidationError,
} from "../errors";
import { AnnouncementOutput, AnnouncementToOutput, InteractionDependencies } from "./common";

export interface InputData {
  guildID: string;
  channel: string;
}

export async function setChannel(
  { guildID, channel }: InputData,
  { announcementRepo, discordService }: InteractionDependencies,
) {
  const guildIDOrError = GuildID.create(guildID);
  const channelOrError = Channel.create(channel);
  const combinedResult = Result.combine([guildIDOrError, channelOrError]);

  if (combinedResult.isFailure) {
    return Response.fail<ValidationError>(new ValidationError(combinedResult.errorValue()));
  }

  const promiseAnnouncementInProgress = announcementRepo.findWorkInProgressByGuildID(
    guildIDOrError.getValue(),
  );

  const promiseTextChannelExists = discordService.textChannelExists(
    guildIDOrError.getValue(),
    channelOrError.getValue(),
  );

  const [announcementInProgress, textChannelExists] = await Promise.all([
    promiseAnnouncementInProgress,
    promiseTextChannelExists,
  ]);

  if (!announcementInProgress) {
    return Response.fail<AnnouncementNotInProgressError>(
      new AnnouncementNotInProgressError(guildID),
    );
  }

  if (!textChannelExists) {
    return Response.fail<TextChannelDoesNotExistError>(
      new TextChannelDoesNotExistError(channelOrError.getValue().value),
    );
  }

  const announcementWithChannel = announcementInProgress.copy({
    channel: channelOrError.getValue(),
  });

  await announcementRepo.save(announcementWithChannel);

  return Response.success<AnnouncementOutput>(AnnouncementToOutput(announcementWithChannel));
}
