/*
Contains definition for an announcement
 */

import { ScheduledTime } from "./ScheduledTime";
import { GuildID } from "./GuildID";
import { Message } from "./Message";
import { Guard, Result, UniqueEntityID } from "../../../../lib";
import { Channel } from "./Channel";
import { ITimeService } from "../../services/time";
import { Timezone } from "../announcementSettings";
import { TimeInPastError } from "../../errors";
import { AnnouncementStatus, Status } from "./Status";

interface AnnouncementProps {
  message?: Message;
  scheduledTime?: ScheduledTime;
  channel?: Channel;
  guildID: GuildID;
  status: Status;
}

interface AnnouncementCopyProps {
  message?: Message;
  scheduledTime?: ScheduledTime;
  channel?: Channel;
  status?: Status;
}

interface PublishProps {
  timeService: ITimeService;
  timezone: Timezone;
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

  get guildID() {
    return this.props.guildID;
  }

  get status() {
    return this.props.status;
  }

  public static create(props: AnnouncementProps, id?: UniqueEntityID): Result<Announcement> {
    const guardedProps = [
      { argument: props.status, argumentName: "status" },
      { argument: props.guildID, argumentName: "guildID" },
    ];
    const validProps = Guard.againstNullOrUndefinedBulk(guardedProps);

    if (!validProps.succeeded) {
      return Result.fail<Announcement>(validProps.message);
    }
    return Result.ok<Announcement>(new Announcement(props, id));
  }

  copy(props?: AnnouncementCopyProps) {
    return Announcement.create(
      {
        message: props?.message || this.message,
        scheduledTime: props?.scheduledTime || this.scheduledTime,
        channel: props?.channel || this.channel,
        guildID: this.guildID,
        status: this.status,
      },
      this.id,
    ).getValue();
  }

  updateMessage(message: Message) {
    Object.assign(this.props, { message });
  }

  updateScheduledTime(scheduledTime: ScheduledTime) {
    Object.assign(this.props, { scheduledTime });
  }

  updateChannel(channel: Channel) {
    Object.assign(this.props, { channel });
  }

  schedule({ timeService, timezone }: PublishProps) {
    const hasNecessaryProps = [this.message, this.channel, this.scheduledTime].reduce(
      (acc, curr) => {
        return acc && !!curr;
      },
      true,
    );

    if (!hasNecessaryProps) {
      return Result.fail<Announcement>(
        "An announcement must have a message, scheduledTime, and channel set before publishing.",
      );
    }

    if (!timeService.isValidFutureTime(this.scheduledTime as ScheduledTime, timezone)) {
      return Result.fail<Announcement>(new TimeInPastError().message);
    }

    const newStatus = Status.create(AnnouncementStatus.scheduled).getValue();

    Object.assign(this.props, { status: newStatus });
    return Result.ok<Announcement>(this);
  }

  unSchedule() {
    if (this.status.value === AnnouncementStatus.sent) {
      return Result.fail<Announcement>("An announcement that has been sent cannot be unscheduled.");
    }

    Object.assign(this.props, { status: AnnouncementStatus.unscheduled });
    return Result.ok<Announcement>(this);
  }

  sent() {
    if (this.status.value !== AnnouncementStatus.scheduled) {
      return Result.fail<Announcement>("An announcement must be scheduled before being sent.");
    }

    Object.assign(this.props, { status: Status.create(AnnouncementStatus.sent).getValue() });
    return Result.ok<Announcement>(this);
  }
}
