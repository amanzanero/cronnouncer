import { Guard, Result } from "../../../../lib";

export enum AnnouncementStatus {
  unscheduled = "unscheduled",
  scheduled = "scheduled",
  sent = "sent",
}

export function isAnnouncementStatus(test: any): test is AnnouncementStatus {
  return Object.values(AnnouncementStatus).indexOf(test) !== -1;
}

interface StatusProps {
  value: AnnouncementStatus;
}

export class Status {
  public readonly props;

  get value(): AnnouncementStatus {
    return this.props.value;
  }

  private constructor(props: StatusProps) {
    this.props = props;
  }

  public static create(status: string): Result<Status> {
    const guardResult = Guard.againstNullOrUndefined(status, "status");
    if (!guardResult.succeeded) {
      return Result.fail<Status>(guardResult.message);
    }

    if (!(status in AnnouncementStatus)) {
      return Result.fail<Status>(`${status} is not a valid announcement status`);
    }

    return Result.ok<Status>(
      new Status({ value: AnnouncementStatus[status as keyof typeof AnnouncementStatus] }),
    );
  }

  copy() {
    return Status.create(this.props.value).getValue();
  }
}
