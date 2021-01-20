import { GuildID } from "../domain/announcement";
import { AnnouncementSettings, Timezone } from "../domain/announcementSettings";
import { Result, UniqueEntityID } from "../../../lib";
import { logger } from "../../../infra/logger";
import { AnnouncementSettings as AnnouncementSettingsModel } from "../../../infra/typeorm/models";

export class AnnouncementSettingsMap {
  public static toPersistence(announcementSettings: AnnouncementSettings): any {
    const persist = new AnnouncementSettingsModel();
    Object.assign(persist, {
      guild_id: announcementSettings.guildID.value,
      announcement_settings_id: announcementSettings.id.value,
      timezone: announcementSettings.timezone?.value,
    });
    return persist;
  }

  public static toDomain(raw: AnnouncementSettingsModel): AnnouncementSettings | undefined {
    const guildIDOrError = GuildID.create(raw.guild_id);
    const timezoneOrError = Timezone.create(raw.timezone);
    const createResults: Result<any>[] = [guildIDOrError, timezoneOrError];

    const results = Result.combine(createResults);
    if (results.isFailure) {
      logger.error(`[AnnouncementSettingsMap.toDomain] couldn't parse - ${results.errorValue()}`);
      return undefined;
    }

    const announcementOrError = AnnouncementSettings.create(
      {
        guildID: guildIDOrError.getValue(),
        timezone: timezoneOrError.getValue(),
      },
      new UniqueEntityID(raw.announcement_settings_id),
    );
    if (announcementOrError.isFailure)
      logger.error(`[AnnouncementSettingsMap.toDomain] couldn't parse - ${results.errorValue()}`);

    return announcementOrError.isSuccess ? announcementOrError.getValue() : undefined;
  }
}
