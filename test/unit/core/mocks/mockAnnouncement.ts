import moment, { Moment } from "moment";
import { v4 } from "uuid";
import { Announcement } from "../../../../src/core/announcement/domain/Announcement";
import { Message } from "../../../../src/core/announcement/domain/Message";
import { DATE_FORMAT, ScheduledTime } from "../../../../src/core/announcement/domain/ScheduledTime";
import { GuildID } from "../../../../src/core/announcement/domain/GuildID";
import { UniqueEntityID } from "../../../../src/lib";
import { SenderID } from "../../../../src/core/announcement/domain/SenderID";

interface OptionalMockAnnouncementProps {
  id?: string;
  guildId?: string;
  scheduledTime?: Moment;
  message?: string;
  senderId?: string;
  published?: boolean;
}

export function createMockAnnouncement(props: OptionalMockAnnouncementProps): Announcement {
  const guildId = GuildID.create(props.guildId || v4()).getValue();
  const scheduledTime = ScheduledTime.create(
    props.scheduledTime
      ? props.scheduledTime.format(DATE_FORMAT)
      : moment().add(1, "day").format(DATE_FORMAT),
  ).getValue();
  const message = Message.create(props.message || "A new announcement!").getValue();
  const senderId = SenderID.create(props.senderId || v4()).getValue();

  return Announcement.create(
    {
      guildId,
      scheduledTime,
      message,
      senderId,
      published: !!props.published,
    },
    new UniqueEntityID(props.id || v4()),
  ).getValue();
}
