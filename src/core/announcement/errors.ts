/**
 * Expected errors
 */

// parent
export abstract class AnnouncementError extends Error {
  protected constructor(message?: string) {
    super(message);
  }
}

export class ValidationError extends AnnouncementError {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, ValidationError.prototype); // makes typescript happy
  }
}

export class AnnouncementNotFoundError extends AnnouncementError {
  constructor(announcementID: string) {
    super(`There was no announcement found with id: \`${announcementID}\``);
    Object.setPrototypeOf(this, AnnouncementNotFoundError.prototype); // makes typescript happy
  }
}

export class AnnouncementLockedStatusError extends AnnouncementError {
  constructor(announcementID: string) {
    super(`Announcement: \`${announcementID}\` has already been sent.`);
    Object.setPrototypeOf(this, AnnouncementLockedStatusError.prototype); // makes typescript happy
  }
}

export class AnnouncementInProgressError extends AnnouncementError {
  constructor(guildID: string) {
    super(`There is already an announcement in progress for server: ${guildID}`);
    Object.setPrototypeOf(this, AnnouncementInProgressError.prototype); // makes typescript happy
  }
}

export class AnnouncementIncompleteError extends AnnouncementError {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, AnnouncementIncompleteError.prototype); // makes typescript happy
  }
}

export class AnnouncementNotInProgressError extends AnnouncementError {
  constructor(guildID: string) {
    super(`There is no announcement in progress for server: ${guildID}`);
    Object.setPrototypeOf(this, AnnouncementNotInProgressError.prototype); // makes typescript happy
  }
}

export class TextChannelDoesNotExistError extends AnnouncementError {
  constructor(channel: string) {
    super(`Channel \`#${channel}\` is not the name of a text channel in this server.`);
    Object.setPrototypeOf(this, TextChannelDoesNotExistError.prototype); // makes typescript happy
  }
}

export class TimezoneNotSetError extends AnnouncementError {
  constructor() {
    super("A timezone must be set before creating an announcement.");
    Object.setPrototypeOf(this, TimezoneNotSetError.prototype); // makes typescript happy
  }
}

export class TimeInPastError extends AnnouncementError {
  constructor() {
    super("Scheduled time must be at least a minute away.");
    Object.setPrototypeOf(this, TimeInPastError.prototype); // makes typescript happy
  }
}

export class InvalidTimeError extends AnnouncementError {
  constructor(time: string) {
    super(`Time: \`${time}\` was not in the correct format.`);
    Object.setPrototypeOf(this, InvalidTimeError.prototype); // makes typescript happy
  }
}
