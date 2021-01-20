/**
 * This file contains the interaction for editing announcement info
 */

import { Message, ScheduledTime } from "../domain/announcement";
import { Guard, Response } from "../../../lib";
import {
  AnnouncementNotFoundError,
  InvalidTimeError,
  TextChannelDoesNotExistError,
  TimeInPastError,
  TimezoneNotSetError,
  ValidationError,
} from "../errors";
import {
  AnnouncementOutput,
  AnnouncementToOutput,
  InteractionDependencies,
  interactionLogWrapper,
} from "./common";

export interface InputData {
  announcementID: string;
  guildID: string;
  channelID?: string;
  message?: string;
  scheduledTime?: string;
}

export async function editAnnouncementInfo(
  { announcementID, guildID, channelID, message, scheduledTime }: InputData,
  deps: InteractionDependencies,
) {
  return await interactionLogWrapper(deps, "editAnnouncementInfo", async () => {
    const { announcementRepo, guildSettingsRepo, discordService, timeService } = deps;

    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argumentName: "announcementID", argument: announcementID },
      { argumentName: "guildID", argument: guildID },
    ]);
    if (!guardResult.succeeded) {
      return Response.fail<ValidationError>(new ValidationError(guardResult.message));
    }

    const [activeAnnouncement, guildSettings] = await Promise.all([
      announcementRepo.findByID(announcementID),
      guildSettingsRepo.findByGuildID(guildID),
    ]);

    if (!activeAnnouncement) {
      return Response.fail<AnnouncementNotFoundError>(
        new AnnouncementNotFoundError(announcementID),
      );
    }

    if (!guildSettings || !guildSettings.timezone) {
      return Response.fail<TimezoneNotSetError>(new TimezoneNotSetError());
    }

    if (message !== undefined) {
      const messageOrError = Message.create(message);
      if (messageOrError.isFailure) {
        return Response.fail<ValidationError>(new ValidationError(messageOrError.errorValue()));
      }

      activeAnnouncement.updateMessage(messageOrError.getValue());
    }

    if (scheduledTime !== undefined) {
      const scheduledTimeOrError = ScheduledTime.create(scheduledTime);
      if (scheduledTimeOrError.isSuccess) {
        const isValidTimeInFuture = !timeService.isValidFutureTime(
          scheduledTimeOrError.getValue(),
          guildSettings.timezone,
        );

        if (isValidTimeInFuture) {
          return Response.fail<TimeInPastError>(new TimeInPastError());
        }

        activeAnnouncement.updateScheduledTime(scheduledTimeOrError.getValue());
      } else {
        return Response.fail<InvalidTimeError>(new InvalidTimeError(scheduledTime));
      }
    }

    if (channelID !== undefined) {
      const promiseTextChannelExists = await discordService.textChannelExists(guildID, channelID);
      if (!promiseTextChannelExists) {
        return Response.fail<TextChannelDoesNotExistError>(
          new TextChannelDoesNotExistError(channelID),
        );
      }

      activeAnnouncement.updateChannelID(channelID);
    }

    await announcementRepo.save(activeAnnouncement);

    return Response.success<AnnouncementOutput>(AnnouncementToOutput(activeAnnouncement));
  });
}
