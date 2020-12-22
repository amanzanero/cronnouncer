import { Moment } from "moment";
import { v4 } from "uuid";
import {
  Announcement,
  Channel,
  DATE_FORMAT,
  GuildID,
  Message,
  ScheduledTime,
} from "../../../../src/core/announcement/domain";
import { UniqueEntityID } from "../../../../src/lib";

interface OptionalMockAnnouncementProps {
  id?: string;
  guildID?: string;
  scheduledTime?: Moment;
  message?: string;
  published?: boolean;
  channel?: string;
}

export function createMockAnnouncement(props: OptionalMockAnnouncementProps): Announcement {
  const guildID = GuildID.create(props.guildID || v4()).getValue();
  const scheduledTime = props.scheduledTime
    ? ScheduledTime.create(props.scheduledTime.format(DATE_FORMAT)).getValue()
    : undefined;

  const message = props.message ? Message.create(props.message).getValue() : undefined;
  const channel = props.channel ? Channel.create(props.channel).getValue() : undefined;

  return Announcement.create(
    {
      guildID,
      channel,
      scheduledTime,
      message,
      published: !!props.published,
    },
    new UniqueEntityID(props.id || v4()),
  ).getValue();
}
