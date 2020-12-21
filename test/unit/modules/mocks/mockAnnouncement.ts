import moment, { Moment } from "moment";
import { v4 } from "uuid";
import { Announcement } from "../../../../src/modules/announcement/domain/announcement";
import { Message } from "../../../../src/modules/announcement/domain/message";
import {
  DATE_FORMAT,
  ScheduledTime,
} from "../../../../src/modules/announcement/domain/scheduledTime";
import { GuildId } from "../../../../src/modules/announcement/domain/guildId";
import { UniqueEntityID } from "../../../../src/lib";
import { SenderId } from "../../../../src/modules/announcement/domain/senderId";

interface OptionalMockAnnouncementProps {
  id?: string;
  guildId?: string;
  scheduledTime?: Moment;
  message?: string;
  senderId?: string;
  published?: boolean;
}

export function createMockAnnouncement(props: OptionalMockAnnouncementProps): Announcement {
  const guildId = GuildId.create(props.guildId || v4()).getValue();
  const scheduledTime = ScheduledTime.create(
    props.scheduledTime
      ? props.scheduledTime.format(DATE_FORMAT)
      : moment().add(1, "day").format(DATE_FORMAT),
  ).getValue();
  const message = Message.create(props.message || "A new announcement!").getValue();
  const senderId = SenderId.create(props.senderId || v4()).getValue();

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
