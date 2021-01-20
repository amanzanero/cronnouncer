import { GuildSettings, Timezone } from "../domain/guildSettings";
import { UniqueEntityID } from "../../../lib";
import { logger } from "../../../infra/logger";
import { GuildSettings as GuildSettingsModel } from "../../../infra/typeorm/models";

export class GuildSettingsMap {
  public static toPersistence(guildSettings: GuildSettings): any {
    const persist = new GuildSettingsModel();
    Object.assign(persist, {
      guild_id: guildSettings.guildID,
      announcement_settings_id: guildSettings.id.value,
      timezone: guildSettings.timezone?.value,
    });
    return persist;
  }

  public static toDomain(raw: GuildSettingsModel): GuildSettings | undefined {
    const timezoneOrError = Timezone.create(raw.timezone);

    if (timezoneOrError.isFailure) {
      logger.error(`[GuildSettingsMap.toDomain] couldn't parse - ${timezoneOrError.errorValue()}`);
      return undefined;
    }

    const announcementOrError = GuildSettings.create(
      {
        guildID: raw.guild_id,
        nextShortID: raw.next_short_id,
        timezone: timezoneOrError.getValue(),
      },
      new UniqueEntityID(raw.guild_settings_id),
    );
    if (announcementOrError.isFailure) {
      logger.error(
        `[GuildSettingsMap.toDomain] couldn't parse - ${announcementOrError.errorValue()}`,
      );
      return undefined;
    }

    return announcementOrError.getValue();
  }
}
