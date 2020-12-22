export class UnexpectedError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

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
