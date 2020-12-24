import { Announcement, Channel, DATE_FORMAT, Message, ScheduledTime } from "../../domain";

export interface InputData {
  guildID: string;
}

export interface OutputData {
  channel: string;
  guildID: string;
  message: string;
  published: boolean;
  scheduledTime: string;
}

export function AnnouncementToOutput(a: Announcement): OutputData {
  return {
    channel: (a.channel as Channel).value,
    guildID: a.guildID.value,
    message: (a.message as Message).value,
    published: a.published,
    scheduledTime: (a.scheduledTime as ScheduledTime).value.format(DATE_FORMAT),
  };
}
