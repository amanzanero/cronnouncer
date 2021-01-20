/*
Contains definition for an announcement
 */

import { Timezone } from "./Timezone";
import { Result, UniqueEntityID } from "../../../../lib";

interface GuildSettingsProps {
  guildID: string;
  nextShortID: number;
  timezone?: Timezone;
}

interface GuildSettingsCopyProps {
  nextShortID?: number;
  timezone?: Timezone;
}

export class GuildSettings {
  protected readonly props: GuildSettingsProps;
  public readonly _id: UniqueEntityID;

  private constructor(props: GuildSettingsProps, id?: UniqueEntityID) {
    this.props = props;
    this._id = id || new UniqueEntityID();
  }

  get id() {
    return this._id;
  }

  get guildID() {
    return this.props.guildID;
  }

  get nextShortID() {
    return this.props.nextShortID;
  }

  get timezone() {
    return this.props.timezone;
  }

  public static create(props: GuildSettingsProps, id?: UniqueEntityID): Result<GuildSettings> {
    return Result.ok<GuildSettings>(new GuildSettings(props, id));
  }

  copy(props?: GuildSettingsCopyProps) {
    return GuildSettings.create(
      {
        guildID: this.guildID,
        nextShortID: props?.nextShortID || this.nextShortID,
        timezone: props?.timezone || this.timezone?.copy(),
      },
      this.id,
    ).getValue();
  }
}
