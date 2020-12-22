import { Guard, Result } from "../../../lib";

interface SenderIdProps {
  value: string;
}

export class SenderId {
  public readonly props;

  get value(): string {
    return this.props.value;
  }

  private constructor(props: SenderIdProps) {
    this.props = props;
  }

  public static create(senderId: string): Result<SenderId> {
    const guardResult = Guard.againstNullOrUndefined(senderId, "senderId");
    if (!guardResult.succeeded) {
      return Result.fail<SenderId>(guardResult.message);
    } else {
      return Result.ok<SenderId>(new SenderId({ value: senderId }));
    }
  }
}
