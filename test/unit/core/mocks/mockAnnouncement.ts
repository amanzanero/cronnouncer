import moment, { Moment } from "moment";
import { v4 } from "uuid";
import { Announcement } from "../../../../src/core/announcement/domain/Announcement";
import { Message } from "../../../../src/core/announcement/domain/Message";
import { DATE_FORMAT, ScheduledTime } from "../../../../src/core/announcement/domain/ScheduledTime";
import { GuildID } from "../../../../src/core/announcement/domain/GuildID";
import { UniqueEntityID } from "../../../../src/lib";

interface OptionalMockAnnouncementProps {
  id?: string;
  guildID?: string;
  scheduledTime?: Moment;
  message?: string;
  published?: boolean;
}

export function createMockAnnouncement(props: OptionalMockAnnouncementProps): Announcement {
  const guildID = GuildID.create(props.guildID || v4()).getValue();
  const scheduledTime = ScheduledTime.create(
    props.scheduledTime
      ? props.scheduledTime.format(DATE_FORMAT)
      : moment().add(1, "day").format(DATE_FORMAT),
  ).getValue();
  const message = Message.create(props.message || "A new announcement!").getValue();

  return Announcement.create(
    {
      guildID,
      scheduledTime,
      message,
      published: !!props.published,
    },
    new UniqueEntityID(props.id || v4()),
  ).getValue();
}
