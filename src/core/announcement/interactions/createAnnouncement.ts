/**
 * This file contains the use case for starting a new announcement
 */
import { Guard, Response } from "../../lib";
import { TimezoneNotSetError, ValidationError } from "../errors";
import {
  AnnouncementOutput,
  AnnouncementToOutput,
  GuildSettingsToOutput,
  InteractionDependencies,
  interactionLogWrapper,
} from "./common";

export interface InputData {
  guildID: string;
  userID: string;
}

export async function createAnnouncement(
  { guildID, userID }: InputData,
  deps: InteractionDependencies,
) {
  return await interactionLogWrapper(deps, "createAnnouncement", async () => {
    // check data transfer object is valid first
    const { identifierService, guildSettingsRepo, meta } = deps;
    const guard = Guard.againstNullOrUndefinedBulk([
      { argument: guildID, argumentName: "guildID" },
      {
        argument: userID,
        argumentName: "userID",
      },
    ]);
    if (!guard.succeeded) {
      const error = new ValidationError(guard.message);
      deps.loggerService.info("createAnnouncement", `incorrectParams: ${guard.message}`, {
        ...meta,
        error,
      });
      return Response.fail<ValidationError>(error);
    }
    // ensure no announcement is already being made
    const guildSettings = await guildSettingsRepo.findByGuildID(guildID);

    if (!guildSettings || !guildSettings.timezone) {
      const error = new TimezoneNotSetError();
      deps.loggerService.info("createAnnouncement", "no timezone or no guild settings", {
        ...meta,
        guildSettingsID: guildSettings && GuildSettingsToOutput(guildSettings),
      });
      return Response.fail<TimezoneNotSetError>(error);
    }

    const newAnnouncement = await identifierService.addAnnouncementIncrementCounter({
      guildID,
      guildSettings,
      userID,
    });

    deps.loggerService.info(
      "createAnnouncement",
      `created announcement: ${newAnnouncement.id.value}`,
      { ...meta, guildSettings: GuildSettingsToOutput(guildSettings) },
    );
    return Response.success<AnnouncementOutput>(AnnouncementToOutput(newAnnouncement));
  });
}
