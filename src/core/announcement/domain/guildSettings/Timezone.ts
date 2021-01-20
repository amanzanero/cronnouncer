import { Guard, Result } from "../../../lib";
import { SUPPORTED_TIMEZONES } from "../../../../constants";

interface TimezoneProps {
  value: string;
}

export class Timezone {
  public readonly props;

  get value(): string {
    return this.props.value;
  }

  private constructor(props: TimezoneProps) {
    this.props = props;
  }

  public static invalidTimezoneMessage(timezone: string) {
    return `\`${timezone}\` is not a recognized timezone.`;
  }

  public static create(timezone: string): Result<Timezone> {
    const guardResult = Guard.againstNullOrUndefined(timezone, "timezone");
    if (!guardResult.succeeded) return Result.fail<Timezone>(guardResult.message);

    if (!SUPPORTED_TIMEZONES.includes(timezone))
      return Result.fail<Timezone>(this.invalidTimezoneMessage(timezone));

    return Result.ok<Timezone>(new Timezone({ value: timezone }));
  }

  copy() {
    return Timezone.create(this.props.value).getValue();
  }
}
