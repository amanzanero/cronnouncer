import { Guard, Result } from "../../../lib";

interface ChannelProps {
  value: string;
}

export class Channel {
  public readonly props;

  get value(): string {
    return this.props.value;
  }

  private constructor(props: ChannelProps) {
    this.props = props;
  }

  public static create(channel: string): Result<Channel> {
    const guardResult = Guard.againstNullOrUndefined(channel, "channel");
    if (!guardResult.succeeded) {
      return Result.fail<Channel>(guardResult.message);
    } else {
      return Result.ok<Channel>(new Channel({ value: channel }));
    }
  }

  copy() {
    return Channel.create(this.props.value).getValue();
  }
}
