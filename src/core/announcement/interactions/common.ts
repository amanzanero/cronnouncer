import moment from "moment";
import { Announcement, DATE_FORMAT } from "../domain";

export interface AnnouncementOutput {
  guildID: string;
  published: boolean;
  channel?: string;
  message?: string;
  scheduledTime?: string;
}

export function AnnouncementToOutput(a: Announcement): AnnouncementOutput {
  const output = {
    guildID: a.guildID.value,
    published: a.published,
  };
  if (a.channel) Object.assign(output, { channel: a.channel.value });
  if (a.message) Object.assign(output, { message: a.message.value });
  if (a.scheduledTime) {
    Object.assign(output, { scheduledTime: moment(a.scheduledTime.value).format(DATE_FORMAT) });
  }
  return output;
}
