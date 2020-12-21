import { Guard, Result } from "../../../lib";

interface GuildProps {
  value: string;
}

export class GuildId {
  public readonly props;

  get value(): string {
    return this.props.value;
  }

  private constructor(props: GuildProps) {
    this.props = props;
  }

  public static create(guildId: string): Result<GuildId> {
    const guardResult = Guard.againstNullOrUndefined(guildId, "guildId");
    if (!guardResult.succeeded) {
      return Result.fail<GuildId>(guardResult.message);
    } else {
      return Result.ok<GuildId>(new GuildId({ value: guildId }));
    }
  }
}
