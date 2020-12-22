/*
Contains definition for an announcement (aggregate root)
 */

import { ScheduledTime } from "./ScheduledTime";
import { GuildID } from "./GuildID";
import { Message } from "./Message";
import { SenderID } from "./SenderID";
import { Guard, Result, UniqueEntityID } from "../../../lib";
import { Channel } from "./Channel";

interface AnnouncementProps {
  message?: Message;
  scheduledTime?: ScheduledTime;
  channel?: Channel;
  guildId: GuildID;
  senderId: SenderID;
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

  get channel() {
    return this.props.channel;
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

  publish() {
    const hasNecessaryProps = [this.message, this.channel, this.scheduledTime].reduce(
      (acc, curr) => {
        return acc && !!curr;
      },
      true,
    );

    if (!hasNecessaryProps) {
      return Result.fail<Announcement>(
        "Must have message, channel, and scheduleTime in order to publish an announcement",
      );
    }

    Object.assign(this.props, { published: true });
    return Result.ok<any>(this);
  }

  public static create(props: AnnouncementProps, id?: UniqueEntityID): Result<Announcement> {
    const guardedProps = [
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
