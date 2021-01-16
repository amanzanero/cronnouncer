/**
 * This file contains the interaction for editing announcement info
 */

import { Channel, GuildID, Message, ScheduledTime } from "../domain/announcement";
import { Response, Result } from "../../../lib";
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
  channel?: string;
  message?: string;
  scheduledTime?: string;
}

export async function editAnnouncementInfo(
  { announcementID, guildID, channel, message, scheduledTime }: InputData,
  deps: InteractionDependencies,
) {
  return await interactionLogWrapper(deps, "editAnnouncementInfo", async () => {
    const { announcementRepo, announcementSettingsRepo, discordService, timeService } = deps;

    if (!announcementID) {
      return Response.fail<ValidationError>(
        new ValidationError("No announcement id was provided."),
      );
    }

    const guildIDOrError = GuildID.create(guildID);

    const [activeAnnouncement, announcementSettings] = await Promise.all([
      announcementRepo.findByID(announcementID),
      announcementSettingsRepo.findByGuildID(guildIDOrError.getValue()),
    ]);

    if (!activeAnnouncement) {
      return Response.fail<AnnouncementNotFoundError>(
        new AnnouncementNotFoundError(announcementID),
      );
    }

    if (!announcementSettings || !announcementSettings.timezone) {
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
          announcementSettings.timezone,
        );

        if (isValidTimeInFuture) {
          return Response.fail<TimeInPastError>(new TimeInPastError());
        }

        activeAnnouncement.updateScheduledTime(scheduledTimeOrError.getValue());
      } else {
        return Response.fail<InvalidTimeError>(new InvalidTimeError(scheduledTime));
      }
    }

    if (channel !== undefined) {
      const channelOrError = Channel.create(channel);
      const promiseTextChannelExists = await discordService.textChannelExists(
        guildIDOrError.getValue(),
        channelOrError.getValue(),
      );
      if (!promiseTextChannelExists) {
        return Response.fail<TextChannelDoesNotExistError>(
          new TextChannelDoesNotExistError(channel),
        );
      }

      activeAnnouncement.updateChannel(channelOrError.getValue());
    }

    await announcementRepo.save(activeAnnouncement);

    return Response.success<AnnouncementOutput>(AnnouncementToOutput(activeAnnouncement));
  });
}
