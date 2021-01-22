import { Announcement, Message, ScheduledTime } from "../domain/announcement";
import { Result, UniqueEntityID } from "../../lib";
import { logger } from "../../../infra/logger";
import { Announcement as AnnouncementModel } from "../../../infra/typeorm/models";
import { Status } from "../domain/announcement/Status";

export class AnnouncementMap {
  public static toPersistence(announcement: Announcement): any {
    const persist = new AnnouncementModel();
    Object.assign(persist, {
      announcement_id: announcement.id.value,
      scheduled_time: announcement.scheduledTime?.value,
      message: announcement.message?.value,
      channel_id: announcement.channelID,
      guild_id: announcement.guildID,
      status: announcement.status.value,
      short_id: announcement.shortID,
    });
    return persist;
  }

  /**
   * Maps persistence data to an announcement entity.
   * @param raw
   */
  public static toDomain(raw: AnnouncementModel): Announcement | undefined {
    const statusOrError = Status.create(raw.status);
    const createResults: Result<any>[] = [statusOrError];

    let messageOrError;
    if (!!raw.message) {
      messageOrError = Message.create(raw.message);
      createResults.push(messageOrError);
    }

    let scheduledTimeOrError;
    if (!!raw.scheduled_time) {
      scheduledTimeOrError = ScheduledTime.create(raw.scheduled_time);
      createResults.push(scheduledTimeOrError);
    }

    const results = Result.combine(createResults);

    if (results.isFailure) {
      logger.error(`[AnnouncementMapper.toDomain] couldn't parse - ${results.errorValue()}`);
      return undefined;
    }

    const announcementOrError = Announcement.create(
      {
        guildID: raw.guild_id,
        message: messageOrError?.getValue(),
        scheduledTime: scheduledTimeOrError?.getValue(),
        channelID: raw.channel_id,
        status: statusOrError.getValue(),
        shortID: raw.short_id,
      },
      new UniqueEntityID(raw.announcement_id),
    );
    if (announcementOrError.isFailure) logger.error(announcementOrError.error);

    return announcementOrError.isSuccess ? announcementOrError.getValue() : undefined;
  }
}
