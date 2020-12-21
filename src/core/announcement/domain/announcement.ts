/*
Contains definition for an announcement (aggregate root)
 */

import { ScheduledTime } from "./scheduledTime";
import { GuildId } from "./guildId";
import { Message } from "./message";
import { SenderId } from "./senderId";
import { Guard, Result, UniqueEntityID } from "../../../lib";

interface AnnouncementProps {
  message: Message;
  scheduledTime: ScheduledTime;
  guildId: GuildId;
  senderId: SenderId;
  published: boolean;
}

export class Announcement {
  protected readonly props: AnnouncementProps;
  public readonly _id: UniqueEntityID;

  private constructor(props: AnnouncementProps, id?: UniqueEntityID) {
    this.props = props;
    this._id = id || new UniqueEntityID();
  }

  get id() {
    return this._id;
  }

  get message() {
    return this.props.message;
  }

  get scheduledTime() {
    return this.props.scheduledTime;
  }

  get guildId() {
    return this.props.guildId;
  }

  get senderId() {
    return this.props.senderId;
  }

  get published() {
    return this.props.published;
  }

  public static create(props: AnnouncementProps, id?: UniqueEntityID): Result<Announcement> {
    const guardedProps = [
      { argument: props.message, argumentName: "message" },
      { argument: props.scheduledTime, argumentName: "scheduledTime" },
      { argument: props.published, argumentName: "published" },
      { argument: props.guildId, argumentName: "guildId" },
      { argument: props.senderId, argumentName: "senderId" },
    ];
    const validProps = Guard.againstNullOrUndefinedBulk(guardedProps);

    if (!validProps.succeeded) {
      return Result.fail<Announcement>(validProps.message);
    }
    return Result.ok<Announcement>(new Announcement(props, id));
  }
}
