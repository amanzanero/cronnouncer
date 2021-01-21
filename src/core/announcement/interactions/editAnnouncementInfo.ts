/**
 * This file contains the interaction for editing announcement info
 */

import { Message, ScheduledTime } from "../domain/announcement";
import { Guard, Response } from "../../lib";
import {
  AnnouncementLockedStatusError,
  AnnouncementNotFoundError,
  InvalidTimeError,
  TextChannelDoesNotExistError,
  TimeInPastError,
  TimezoneNotSetError,
  ValidationError,
} from "../errors";
import { AnnouncementStatus } from "../domain/announcement/Status";
import {
  AnnouncementOutput,
  AnnouncementToOutput,
  GuildSettingsToOutput,
  InteractionDependencies,
  interactionLogWrapper,
} from "./common";

export interface InputData {
  announcementID: number;
  guildID: string;
  channelID?: string;
  message?: string;
  scheduledTime?: string;
}

export async function editAnnouncementInfo(
  { announcementID: shortID, guildID, channelID, message, scheduledTime }: InputData,
  deps: InteractionDependencies,
) {
  return await interactionLogWrapper(deps, "editAnnouncementInfo", async () => {
    const { announcementRepo, guildSettingsRepo, discordService, timeService } = deps;
    const meta = { requestID: deps.requestID, shortID, guildID };

    const guardUndefined = Guard.againstNullOrUndefinedBulk([
      { argumentName: "announcementID", argument: shortID },
      { argumentName: "guildID", argument: guildID },
    ]);
    const guardNaN = Guard.againstNaN(shortID, "announcementID");
    const guardResult = Guard.combine([guardUndefined, guardNaN]);
    if (!guardResult.succeeded) {
      return Response.fail<ValidationError>(new ValidationError(guardResult.message));
    }

    const [activeAnnouncement, guildSettings] = await Promise.all([
      announcementRepo.findByShortID(shortID, guildID),
      guildSettingsRepo.findByGuildID(guildID),
    ]);

    if (!activeAnnouncement) {
      deps.loggerService.info("editAnnouncementInfo", `announcement with id: ${shortID} DNE`, meta);
      return Response.fail<AnnouncementNotFoundError>(
        new AnnouncementNotFoundError(shortID.toString()),
      );
    }

    if (!guildSettings || !guildSettings.timezone) {
      deps.loggerService.info(
        "editAnnouncementInfo",
        "validation: no guild settings or timezone",
        meta,
      );
      return Response.fail<TimezoneNotSetError>(new TimezoneNotSetError());
    }

    const updatedMeta = {
      ...meta,
      guildSettings: GuildSettingsToOutput(guildSettings),
      announcementID: activeAnnouncement.id.value,
    };

    if (activeAnnouncement.status.value === AnnouncementStatus.sent) {
      deps.loggerService.info("editAnnouncementInfo", "cannot edit sent announcement", updatedMeta);
      return Response.fail<AnnouncementLockedStatusError>(
        new AnnouncementLockedStatusError(shortID.toString()),
      );
    }

    if (message !== undefined) {
      const messageOrError = Message.create(message);
      if (messageOrError.isFailure) {
        deps.loggerService.info(
          "editAnnouncementInfo",
          `validation: ${messageOrError.errorValue()}`,
          updatedMeta,
        );
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
          const e = new TimeInPastError();
          deps.loggerService.info("editAnnouncementInfo", `validation: ${e.message}`, updatedMeta);
          return Response.fail<TimeInPastError>(e);
        }

        activeAnnouncement.updateScheduledTime(scheduledTimeOrError.getValue());
      } else {
        const e = new InvalidTimeError(scheduledTime);
        deps.loggerService.info("editAnnouncementInfo", `validation: ${e.message}`, updatedMeta);
        return Response.fail<InvalidTimeError>(e);
      }
    }

    if (channelID !== undefined) {
      const promiseTextChannelExists = await discordService.textChannelExists(guildID, channelID);
      if (!promiseTextChannelExists) {
        const e = new TextChannelDoesNotExistError(channelID);
        deps.loggerService.info("editAnnouncementInfo", `validation: ${e.message}`, updatedMeta);
        return Response.fail<TextChannelDoesNotExistError>(e);
      }

      activeAnnouncement.updateChannelID(channelID);
    }

    await announcementRepo.save(activeAnnouncement);
    deps.loggerService.info(
      "editAnnouncementInfo",
      `announcement: ${activeAnnouncement.id.value} successfully edited`,
      { ...updatedMeta, announcement: AnnouncementToOutput(activeAnnouncement) },
    );

    return Response.success<AnnouncementOutput>(AnnouncementToOutput(activeAnnouncement));
  });
}
