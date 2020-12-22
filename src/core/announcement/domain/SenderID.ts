import { Guard, Result } from "../../../lib";

interface SenderIdProps {
  value: string;
}

export class SenderID {
  public readonly props;

  get value(): string {
    return this.props.value;
  }

  private constructor(props: SenderIdProps) {
    this.props = props;
  }

  public static create(senderId: string): Result<SenderID> {
    const guardResult = Guard.againstNullOrUndefined(senderId, "senderId");
    if (!guardResult.succeeded) {
      return Result.fail<SenderID>(guardResult.message);
    } else {
      return Result.ok<SenderID>(new SenderID({ value: senderId }));
    }
  }
}
