import moment from "moment-timezone";
import { DATE_FORMAT } from "./cron";
import { ScheduledTime } from "../domain/announcement";
import { Timezone } from "../domain/announcementSettings";

export interface ITimeService {
  isValidFutureTime(scheduledTime: ScheduledTime, timezone: Timezone): boolean;

  scheduleTimeToUTC(scheduledTime: ScheduledTime, timezone: Timezone): string;
}

export class TimeService implements ITimeService {
  isValidFutureTime(scheduledTime: ScheduledTime, timezone: Timezone): boolean {
    const mTime = moment.tz(scheduledTime.value, DATE_FORMAT, timezone.value);
    const minuteFromNow = moment.tz(timezone.value).add(1, "minute");
    return mTime.isAfter(minuteFromNow);
  }

  scheduleTimeToUTC(scheduledTime: ScheduledTime, timezone: Timezone) {
    const mTime = moment.tz(scheduledTime.value, DATE_FORMAT, timezone.value);
    return mTime.toISOString();
  }
}
