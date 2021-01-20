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
}

export async function createAnnouncement({ guildID }: InputData, deps: InteractionDependencies) {
  return await interactionLogWrapper(deps, "createAnnouncement", async () => {
    // check data transfer object is valid first
    const { identifierService, guildSettingsRepo } = deps;
    const meta = { guildID, requestID: deps.requestID };
    const guard = Guard.againstNullOrUndefined(guildID, "guildID");
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
        guildSettingsID: guildSettings?.id.value || -1, // -1 means DNE
      });
      return Response.fail<TimezoneNotSetError>(error);
    }

    const newAnnouncement = await identifierService.addAnnouncementIncrementCounter(
      guildID,
      guildSettings,
    );

    deps.loggerService.info(
      "createAnnouncement",
      `created announcement: ${newAnnouncement.id.value}`,
      { ...meta, guildSettings: GuildSettingsToOutput(guildSettings) },
    );
    return Response.success<AnnouncementOutput>(AnnouncementToOutput(newAnnouncement));
  });
}
