/**
 * This file contains the interaction for setting the announcement channel
 */

import { IAnnouncementRepo } from "../../repos/AnnouncementRepo";
import { InputData } from "./dataTransfer";
import { Channel, GuildID } from "../../domain";
import { Response, Result, InteractionExecute } from "../../../../lib";
import {
  AnnouncementError,
  AnnouncementNotInProgressError,
  ChannelDoesNotExistError,
  ValidationError,
} from "../../errors";
import { AnnouncementOutput, AnnouncementToOutput } from "../common";
import { IDiscordService } from "../../services/discord";

export function makeSetChannel(
  announcementRepo: IAnnouncementRepo,
  discordService: IDiscordService,
): InteractionExecute<InputData, AnnouncementOutput | AnnouncementError> {
  return async function execute(input: InputData) {
    const { guildID, channel } = input;

    const guildIDOrError = GuildID.create(guildID);
    const channelOrError = Channel.create(channel);
    const combinedResult = Result.combine([guildIDOrError, channelOrError]);

    if (combinedResult.isFailure) {
      return Response.fail<ValidationError>(new ValidationError(combinedResult.errorValue()));
    }

    const promiseAnnouncementInProgress = announcementRepo.findWorkInProgressByGuildId(
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
        new ChannelDoesNotExistError(
          channelOrError.getValue().value,
          guildIDOrError.getValue().value,
        ),
      );
    }

    const announcementWithChannel = announcementInProgress.copy({
      channel: channelOrError.getValue(),
    });

    await announcementRepo.save(announcementWithChannel);

    return Response.success<AnnouncementOutput>(AnnouncementToOutput(announcementWithChannel));
  };
}
