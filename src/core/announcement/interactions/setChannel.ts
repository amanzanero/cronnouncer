/**
 * This file contains the interaction for setting the announcement channel
 */

import { Channel, GuildID } from "../domain";
import { Response, Result } from "../../../lib";
import {
  AnnouncementNotInProgressError,
  ChannelDoesNotExistError,
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

  const promiseChannelExists = discordService.channelExists(
    guildIDOrError.getValue(),
    channelOrError.getValue(),
  );

  const [announcementInProgress, channelExists] = await Promise.all([
    promiseAnnouncementInProgress,
    promiseChannelExists,
  ]);

  if (!announcementInProgress) {
    return Response.fail<AnnouncementNotInProgressError>(
      new AnnouncementNotInProgressError(guildID),
    );
  }

  if (!channelExists) {
    return Response.fail<ChannelDoesNotExistError>(
      new ChannelDoesNotExistError(channelOrError.getValue().value),
    );
  }

  const announcementWithChannel = announcementInProgress.copy({
    channel: channelOrError.getValue(),
  });

  await announcementRepo.save(announcementWithChannel);

  return Response.success<AnnouncementOutput>(AnnouncementToOutput(announcementWithChannel));
}
