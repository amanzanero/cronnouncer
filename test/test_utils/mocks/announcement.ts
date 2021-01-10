import { Moment } from "moment";
import { v4 } from "uuid";
import {
  Announcement,
  Channel,
  GuildID,
  Message,
  ScheduledTime,
} from "../../../src/core/announcement/domain/announcement";
import { UniqueEntityID } from "../../../src/lib";
import { DATE_FORMAT } from "../../../src/core/announcement/services/cron";
import {
  AnnouncementStatus,
  Status,
} from "../../../src/core/announcement/domain/announcement/Status";

interface OptionalMockAnnouncementProps {
  id?: string;
  guildID?: string;
  scheduledTime?: Moment;
  message?: string;
  status?: AnnouncementStatus;
  channel?: string;
}

export function createMockAnnouncement(props: OptionalMockAnnouncementProps): Announcement {
  const guildID = GuildID.create(props.guildID || v4()).getValue();
  const status = Status.create(props.status || AnnouncementStatus.active).getValue();

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
      status,
    },
    new UniqueEntityID(props.id || v4()),
  ).getValue();
}
