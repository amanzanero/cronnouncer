import { Guard, Result } from "../../../lib";
import moment, { Moment } from "moment";

interface ScheduledTimeProps {
  value: Moment | undefined;
}

const DATE_FORMAT = "MM-DD-YYYY hh:mm a";

export class ScheduledTime {
  public readonly props;

  get value(): Moment | undefined {
    return this.props.value;
  }

  isEmpty(): boolean {
    return !!this.props.value;
  }

  private constructor(props: ScheduledTimeProps) {
    this.props = props;
  }

  /**
   * Accepts a valid date in format: "MM-DD-YYYY hh:mm a", or nothing
   * @param time
   */
  public static create(time?: string): Result<ScheduledTime> {
    const guardResult = Guard.againstNullOrUndefined(time, "time");
    if (!guardResult.succeeded)
      return Result.ok<ScheduledTime>(new ScheduledTime({ value: undefined }));

    const mTime = moment(time, DATE_FORMAT, true);
    if (!mTime.isValid())
      return Result.fail<ScheduledTime>(`The date '${time}' was not in the correct format`);

    return Result.ok<ScheduledTime>(new ScheduledTime({ value: mTime }));
  }
}
