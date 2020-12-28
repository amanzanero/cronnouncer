import moment from "moment";
import { Announcement, Channel, DATE_FORMAT, GuildID, Message, ScheduledTime } from "../domain";
import { Result, UniqueEntityID } from "../../../lib";
import { logger } from "../../../services";
import { Announcement as AnnouncementModel } from "../../../infra/typeorm/announcementModel";

export class AnnouncementMap {
  public static toPersistence(announcement: Announcement): any {
    const persist = new AnnouncementModel();
    Object.assign(persist, {
      announcement_id: announcement.id.value,
      scheduled_time: announcement.scheduledTime?.value.toISOString(),
      message: announcement.message?.value,
      channel: announcement.channel?.value,
      guild_id: announcement.guildID.value,
      published: announcement.published,
    });
    return persist;
  }

  /**
   * Maps persistence data to an announcement entity.
   * @param raw
   */
  public static toDomain(raw: AnnouncementModel): Announcement | undefined {
    const guildIDOrError = GuildID.create(raw.guild_id);

    const createResults: Result<any>[] = [guildIDOrError];

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
      const date = moment(raw.scheduled_time);
      scheduledTimeOrError = ScheduledTime.create(date.format(DATE_FORMAT));
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
        channel: channelOrError?.getValue(),
        published: raw.published,
      },
      new UniqueEntityID(raw.announcement_id),
    );
    announcementOrError.isFailure ? console.log(announcementOrError.error) : "";

    return announcementOrError.isSuccess ? announcementOrError.getValue() : undefined;
  }
}
