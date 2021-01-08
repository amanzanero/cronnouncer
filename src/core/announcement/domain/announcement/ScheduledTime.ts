import { Guard, Result } from "../../../../lib";
import { DATE_FORMAT } from "../../services/cron";
import moment from "moment-timezone";

interface ScheduledTimeProps {
  value: string;
}

export class ScheduledTime {
  public readonly props;

  get value(): string {
    return this.props.value;
  }

  private constructor(props: ScheduledTimeProps) {
    this.props = props;
  }

  static isCorrectDateTimeFormat(time: string): boolean {
    const mTime = moment(time, DATE_FORMAT, true);
    return mTime.isValid();
  }

  static invalidTimeMessage(time: string) {
    return `Time: \`${time}\` was not in the correct format.`;
  }

  public static create(time: string): Result<ScheduledTime> {
    const guardResult = Guard.againstNullOrUndefined(time, "time");
    if (!guardResult.succeeded) {
      return Result.fail<ScheduledTime>(guardResult.message);
    }

    if (!ScheduledTime.isCorrectDateTimeFormat(time)) {
      return Result.fail<ScheduledTime>(ScheduledTime.invalidTimeMessage(time));
    }

    return Result.ok<ScheduledTime>(new ScheduledTime({ value: time }));
  }

  copy() {
    return new ScheduledTime({ value: this.props.value });
  }
}
