import { Announcement, Channel, GuildID, Message, ScheduledTime } from "../domain/announcement";
import { Result, UniqueEntityID } from "../../../lib";
import { logger } from "../../../util";
import { Announcement as AnnouncementModel } from "../../../infra/typeorm/models";
import { Status } from "../domain/announcement/Status";

export class AnnouncementMap {
  public static toPersistence(announcement: Announcement): any {
    const persist = new AnnouncementModel();
    Object.assign(persist, {
      announcement_id: announcement.id.value,
      scheduled_time: announcement.scheduledTime?.value,
      message: announcement.message?.value,
      channel: announcement.channel?.value,
      guild_id: announcement.guildID.value,
      status: announcement.status.value,
    });
    return persist;
  }

  /**
   * Maps persistence data to an announcement entity.
   * @param raw
   */
  public static toDomain(raw: AnnouncementModel): Announcement | undefined {
    const guildIDOrError = GuildID.create(raw.guild_id);
    const statusOrError = Status.create(raw.status);
    const createResults: Result<any>[] = [guildIDOrError, statusOrError];

    let channelOrError;
    if (!!raw.channel) {
      channelOrError = Channel.create(raw.channel);
      createResults.push(channelOrError);
    }

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
        guildID: guildIDOrError.getValue(),
        message: messageOrError?.getValue(),
        scheduledTime: scheduledTimeOrError?.getValue(),
        channel: channelOrError?.getValue(),
        status: statusOrError.getValue(),
      },
      new UniqueEntityID(raw.announcement_id),
    );
    if (announcementOrError.isFailure) logger.error(announcementOrError.error);

    return announcementOrError.isSuccess ? announcementOrError.getValue() : undefined;
  }
}
