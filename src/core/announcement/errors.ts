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
  }
}

export class AnnouncementInProgressError extends AnnouncementError {
  constructor(guildID: string) {
    super(`There is already an announcement in progress for server: ${guildID}`);
  }
}

export class AnnouncementIncompleteError extends AnnouncementError {
  constructor() {
    super("An announcement must have a message, scheduledTime, and channel set before publishing");
  }
}

export class AnnouncementNotInProgressError extends AnnouncementError {
  constructor(guildID: string) {
    super(`There is no announcement in progress for server: ${guildID}`);
  }
}

export class ChannelDoesNotExistError extends AnnouncementError {
  constructor(channel: string, guildID: string) {
    super(`Channel: ${channel} does not exist in server: ${guildID}`);
  }
}
