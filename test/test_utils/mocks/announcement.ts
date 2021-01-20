import { Moment } from "moment";
import { v4 } from "uuid";
import {
  Announcement,
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
  channelID?: string;
}

export function createMockAnnouncement(props: OptionalMockAnnouncementProps): Announcement {
  const status = Status.create(props.status || AnnouncementStatus.unscheduled).getValue();

  const scheduledTime = props.scheduledTime
    ? ScheduledTime.create(props.scheduledTime.format(DATE_FORMAT)).getValue()
    : undefined;
  const message = props.message ? Message.create(props.message).getValue() : undefined;

  return Announcement.create(
    {
      guildID: props.guildID || v4(),
      channelID: props.channelID,
      scheduledTime,
      message,
      status,
    },
    new UniqueEntityID(props.id || v4()),
  ).getValue();
}
