/*
Contains definition for an announcement
 */

import { Guard, Result, UniqueEntityID } from "../../../lib";
import { ITimeService } from "../../services/time";
import { Timezone } from "../guildSettings";
import { TimeInPastError } from "../../errors";
import { Message } from "./Message";
import { ScheduledTime } from "./ScheduledTime";
import { AnnouncementStatus, Status } from "./Status";

interface AnnouncementProps {
  message?: Message;
  scheduledTime?: ScheduledTime;
  channelID?: string;
  guildID: string;
  status: Status;
  shortID: number;
}

interface AnnouncementCopyProps {
  message?: Message;
  scheduledTime?: ScheduledTime;
  channelID?: string;
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

  get channelID() {
    return this.props.channelID;
  }

  get guildID() {
    return this.props.guildID;
  }

  get status() {
    return this.props.status;
  }

  get shortID() {
    return this.props.shortID;
  }

  public static create(props: AnnouncementProps, id?: UniqueEntityID): Result<Announcement> {
    const guardedProps = [
      { argument: props.status, argumentName: "status" },
      { argument: props.guildID, argumentName: "guildID" },
      { argument: props.shortID, argumentName: "shortID" },
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
        channelID: props?.channelID || this.channelID,
        guildID: this.guildID,
        status: this.status,
        shortID: this.shortID,
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

  updateChannelID(channelID: string) {
    Object.assign(this.props, { channelID });
  }

  schedule({ timeService, timezone }: PublishProps) {
    const hasNecessaryProps = [this.message, this.channelID, this.scheduledTime].reduce(
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
