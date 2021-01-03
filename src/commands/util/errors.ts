import {
  AnnouncementError,
  AnnouncementIncompleteError,
  AnnouncementInProgressError,
  AnnouncementNotInProgressError,
  TextChannelDoesNotExistError,
  ValidationError,
} from "../../core/announcement/errors";
import { Message } from "discord.js";
import { logger } from "../../util";

interface ErrorActionProps {
  responseError: AnnouncementError;
  message: Message;
}

export function getActionFromError({ message, responseError }: ErrorActionProps) {
  switch (responseError.constructor) {
    case ValidationError:
      return () => message.channel.send(responseError.message);
    case AnnouncementIncompleteError:
      return () => message.channel.send(responseError.message);
    case AnnouncementInProgressError:
      return () =>
        message.channel.send("There is already an announcement in progress for this server.");
    case AnnouncementNotInProgressError:
      return () => message.channel.send("`There is no announcement in progress for this server.`");
    case TextChannelDoesNotExistError:
      return () => message.channel.send(responseError.message);
    default:
      return async () => {
        logger.error(responseError);
      };
  }
}
