import { Announcement, GuildID, Message, ScheduledTime } from "../domain";
import { Result, UniqueEntityID } from "../../../lib";
import { logger } from "../../../services";

export class AnnouncementMap {
  public static toPersistence(announcement: Announcement): any {
    return {
      announcement_id: announcement.id.toString(),
      scheduled_time: announcement.scheduledTime
        ? announcement.scheduledTime.value.toISOString()
        : "",
      message: announcement.message ? announcement.message.value : "",
      guild_id: announcement.guildID.value,
      published: announcement.published,
    };
  }

  /**
   * Maps persistence data to an announcement entity.
   * @param raw
   */
  public static toDomain(raw: any): Announcement | undefined {
    const guildIDOrError = GuildID.create(raw.guild_id);

    const createResults: Result<any>[] = [guildIDOrError];

    let messageOrError: Result<Message> | undefined;
    if (!!raw.message && raw.message.length > 0) {
      messageOrError = Message.create(raw.message);
      createResults.push(messageOrError);
    }

    let scheduledTimeOrError: Result<ScheduledTime> | undefined;
    if (!!raw.scheduled_time && raw.scheduled_time.length > 0) {
      scheduledTimeOrError = ScheduledTime.create(raw.scheduled_time);
      createResults.push(scheduledTimeOrError);
    }

    const results = Result.combine(createResults);

    if (results.isFailure) {
      logger.error(`[AnnouncementMapper.toDomain] couldn't parse: ${raw}`);
      return undefined;
    }

    const announcementOrError = Announcement.create(
      {
        guildID: guildIDOrError.getValue(),
        message: messageOrError?.getValue(),
        scheduledTime: scheduledTimeOrError?.getValue(),
        published: raw.published,
      },
      new UniqueEntityID(raw.announcement_id),
    );

    announcementOrError.isFailure ? console.log(announcementOrError.error) : "";

    return announcementOrError.isSuccess ? announcementOrError.getValue() : undefined;
  }
}
