/**
 * This file contains the interaction for setting the announcement time
 */

import { GuildID } from "../domain/announcement";
import { Response, Result } from "../../../lib";
import { ValidationError } from "../errors";
import {
  AnnouncementSettingsOutput,
  AnnouncementSettingsToOutput,
  InteractionDependencies,
} from "./common";
import { AnnouncementSettings, Timezone } from "../domain/announcementSettings";

export interface InputData {
  guildID: string;
  timezone: string;
}

export async function setAnnouncementTimezone(
  { guildID, timezone }: InputData,
  { announcementSettingsRepo }: InteractionDependencies,
) {
  const guildIDOrError = GuildID.create(guildID);
  const timezoneOrError = Timezone.create(timezone);
  const combinedResult = Result.combine([guildIDOrError, timezoneOrError]);

  if (combinedResult.isFailure) {
    return Response.fail<ValidationError>(new ValidationError(combinedResult.errorValue()));
  }

  let announcementSettings = await announcementSettingsRepo.getByGuildID(guildIDOrError.getValue());

  if (!announcementSettings) {
    announcementSettings = AnnouncementSettings.create({
      guildID: guildIDOrError.getValue(),
      timezone: timezoneOrError.getValue(),
    }).getValue();
  } else {
    announcementSettings = announcementSettings.copy({ timezone: timezoneOrError.getValue() });
  }

  await announcementSettingsRepo.save(announcementSettings);

  return Response.success<AnnouncementSettingsOutput>(
    AnnouncementSettingsToOutput(announcementSettings),
  );
}
