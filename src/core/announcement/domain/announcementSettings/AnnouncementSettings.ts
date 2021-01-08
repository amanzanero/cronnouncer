/*
Contains definition for an announcement
 */

import { Timezone } from "./Timezone";
import { Result, UniqueEntityID } from "../../../../lib";
import { GuildID } from "../announcement";

interface AnnouncementSettingsProps {
  guildID: GuildID;
  timezone: Timezone;
}

interface AnnouncementSettingsCopyProps {
  timezone?: Timezone;
}

export class AnnouncementSettings {
  protected readonly props: AnnouncementSettingsProps;
  public readonly _id: UniqueEntityID;

  private constructor(props: AnnouncementSettingsProps, id?: UniqueEntityID) {
    this.props = props;
    this._id = id || new UniqueEntityID();
  }

  get id() {
    return this._id;
  }

  get guildID() {
    return this.props.guildID;
  }

  get timezone() {
    return this.props.timezone;
  }

  public static create(
    props: AnnouncementSettingsProps,
    id?: UniqueEntityID,
  ): Result<AnnouncementSettings> {
    return Result.ok<AnnouncementSettings>(new AnnouncementSettings(props, id));
  }

  copy(props?: AnnouncementSettingsCopyProps) {
    return AnnouncementSettings.create(
      {
        guildID: this.guildID.copy(),
        timezone: props?.timezone || this.timezone?.copy(),
      },
      this.id,
    ).getValue();
  }
}
