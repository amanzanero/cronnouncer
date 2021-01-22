/**
 * This file contains the interaction for setting the announcement time
 */

import { Guard, Response } from "../../lib";
import { ValidationError } from "../errors";
import { GuildSettings, Timezone } from "../domain/guildSettings";
import {
  GuildSettingsOutput,
  GuildSettingsToOutput,
  InteractionDependencies,
  interactionLogWrapper,
} from "./common";

export interface InputData {
  guildID: string;
  timezone: string;
}

export async function setGuildTimezone(
  { guildID, timezone }: InputData,
  deps: InteractionDependencies,
) {
  return await interactionLogWrapper(deps, "setGuildTimezone", async () => {
    const { guildSettingsRepo, meta } = deps;

    const guard = Guard.againstNullOrUndefined(guildID, "guildID");
    const timezoneOrError = Timezone.create(timezone);

    if (timezoneOrError.isFailure || !guard.succeeded) {
      const message = timezoneOrError.isFailure ? timezoneOrError.errorValue() : guard.message;

      deps.loggerService.info("setGuildTimezone", `validation: ${message}`, meta);
      return Response.fail<ValidationError>(new ValidationError(message));
    }

    let guildSettings = await guildSettingsRepo.findByGuildID(guildID);

    if (!guildSettings) {
      // this should only happen if guild settings failed to get added "onGuildCreate"
      guildSettings = GuildSettings.create({
        guildID,
        timezone: timezoneOrError.getValue(),
        nextShortID: 1,
      }).getValue();
    } else {
      guildSettings = guildSettings.copy({ timezone: timezoneOrError.getValue() });
    }

    await guildSettingsRepo.save(guildSettings);
    deps.loggerService.info("setGuildTimezone", `set "${timezone}" for server: ${guildID}`, meta);
    return Response.success<GuildSettingsOutput>(GuildSettingsToOutput(guildSettings));
  });
}
