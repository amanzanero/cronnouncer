import moment from "moment";
import { Guard, Result } from "../../../lib";

interface ScheduledTimeProps {
  value: Date;
}

export const DATE_FORMAT = "M/D/YYYY h:mm a";

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
  public static create(time: Date): Result<ScheduledTime> {
    const guardResult = Guard.againstNullOrUndefined(time, "time");
    if (!guardResult.succeeded) return Result.fail<ScheduledTime>(guardResult.message);

    const mTime = moment(time);
    const minuteFromNow = moment().add(1, "minute");

    if (!mTime.isAfter(minuteFromNow))
      return Result.fail<ScheduledTime>("Scheduled time must be at least a minute away.");

    return Result.ok<ScheduledTime>(new ScheduledTime({ value: mTime.toDate() }));
  }

  copy() {
    return ScheduledTime.create(this.props.value).getValue();
  }
}
