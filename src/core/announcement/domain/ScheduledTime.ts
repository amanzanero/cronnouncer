import moment from "moment";
import { Guard, Result } from "../../../lib";

interface ScheduledTimeProps {
  value: Date;
}

export const DATE_FORMAT = "M/D/YYYY h:mm a";

export function invalidDateMessage(time: string) {
  return `Time: ${time} was not formatted correctly.`;
}

export class ScheduledTime {
  public readonly props;

  get value(): Date {
    return this.props.value;
  }

  private constructor(props: ScheduledTimeProps) {
    this.props = props;
  }

  /**
   * Accepts a date object
   * @param time
   */
  public static create(time: string): Result<ScheduledTime> {
    const guardResult = Guard.againstNullOrUndefined(time, "time");
    if (!guardResult.succeeded) return Result.fail<ScheduledTime>(guardResult.message);

    const mTime = moment(time, DATE_FORMAT, true);

    if (!mTime.isValid()) return Result.fail<ScheduledTime>(invalidDateMessage(time));

    const minuteFromNow = moment().add(1, "minute");

    if (!mTime.isAfter(minuteFromNow))
      return Result.fail<ScheduledTime>("Scheduled time must be at least a minute away.");

    return Result.ok<ScheduledTime>(new ScheduledTime({ value: mTime.toDate() }));
  }

  public static __createFromPersistence(time: string): Result<ScheduledTime> {
    const guardResult = Guard.againstNullOrUndefined(time, "time");
    if (!guardResult.succeeded) return Result.fail<ScheduledTime>(guardResult.message);

    const mTime = moment(time);

    return Result.ok<ScheduledTime>(new ScheduledTime({ value: mTime.toDate() }));
  }

  copy() {
    return new ScheduledTime({ value: moment(this.props.value).toDate() });
  }
}
