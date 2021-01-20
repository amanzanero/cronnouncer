import { Moment } from "moment";
import { v4 } from "uuid";
import {
  Announcement,
  Message,
  ScheduledTime,
} from "../../../src/core/announcement/domain/announcement";
import { UniqueEntityID } from "../../../src/core/lib";
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
  shortID?: number;
}

/**
 * https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
      shortID: props.shortID || getRandomInt(0, 1000),
    },
    new UniqueEntityID(props.id || v4()),
  ).getValue();
}
