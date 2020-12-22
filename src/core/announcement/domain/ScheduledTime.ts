import { Guard, Result } from "../../../lib";
import moment, { Moment } from "moment";

interface ScheduledTimeProps {
  value: Moment;
}

export const DATE_FORMAT = "MM-DD-YYYY hh:mm a";

export class ScheduledTime {
  public readonly props;

  get value(): Moment {
    return this.props.value;
  }

  private constructor(props: ScheduledTimeProps) {
    this.props = props;
  }

  /**
   * Accepts a valid date in format: "MM-DD-YYYY hh:mm a", or nothing
   * @param time
   */
  public static create(time: string): Result<ScheduledTime> {
    const guardResult = Guard.againstNullOrUndefined(time, "time");
    if (!guardResult.succeeded) return Result.fail<ScheduledTime>(guardResult.message);

    const mTime = moment(time, DATE_FORMAT, true);
    if (!mTime.isValid())
      return Result.fail<ScheduledTime>(`The date '${time}' was not in the correct format`);

    return Result.ok<ScheduledTime>(new ScheduledTime({ value: mTime }));
  }
}
