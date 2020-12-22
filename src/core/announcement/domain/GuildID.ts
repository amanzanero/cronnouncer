import { Guard, Result } from "../../../lib";

interface GuildProps {
  value: string;
}

export class GuildID {
  public readonly props;

  get value(): string {
    return this.props.value;
  }

  private constructor(props: GuildProps) {
    this.props = props;
  }

  public static create(guildId: string): Result<GuildID> {
    const guardResult = Guard.againstNullOrUndefined(guildId, "guildId");
    if (!guardResult.succeeded) {
      return Result.fail<GuildID>(guardResult.message);
    } else {
      return Result.ok<GuildID>(new GuildID({ value: guildId }));
    }
  }
}