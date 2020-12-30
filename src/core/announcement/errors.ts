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

export class AnnouncementInProgressError extends AnnouncementError {
  constructor(guildID: string) {
    super(`There is already an announcement in progress for server: ${guildID}`);
    Object.setPrototypeOf(this, AnnouncementInProgressError.prototype); // makes typescript happy
  }
}

export class AnnouncementIncompleteError extends AnnouncementError {
  constructor() {
    super("An announcement must have a message, scheduledTime, and channel set before publishing");
    Object.setPrototypeOf(this, AnnouncementIncompleteError.prototype); // makes typescript happy
  }
}

export class AnnouncementNotInProgressError extends AnnouncementError {
  constructor(guildID: string) {
    super(`There is no announcement in progress for server: ${guildID}`);
    Object.setPrototypeOf(this, AnnouncementNotInProgressError.prototype); // makes typescript happy
  }
}

export class ChannelDoesNotExistError extends AnnouncementError {
  constructor(channel: string) {
    super(`Channel \`#${channel}\` does not exist in this server.`);
    Object.setPrototypeOf(this, ChannelDoesNotExistError.prototype); // makes typescript happy
  }
}
