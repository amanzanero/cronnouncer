import { Guard, Result } from "../../../lib";

interface MessageProps {
  value: string;
}

const MAX_LENGTH = 500;
const MIN_LENGTH = 1;

export class Message {
  public readonly props;

  get value(): string {
    return this.props.value;
  }

  private static isAppropriateLength(message: string) {
    return message.length >= MIN_LENGTH && message.length <= MAX_LENGTH;
  }

  private constructor(props: MessageProps) {
    this.props = props;
  }

  public static create(message: string): Result<Message> {
    const guardResult = Guard.againstNullOrUndefined(message, "message");
    if (!guardResult.succeeded) return Result.fail<Message>(guardResult.message);

    if (!Message.isAppropriateLength(message as string))
      return Result.fail<Message>(
        `The incoming message was not between ${MIN_LENGTH} and ${MAX_LENGTH}`,
      );

    return Result.ok<Message>(new Message({ value: message }));
  }

  copy() {
    return Message.create(this.props.value).getValue();
  }
}
