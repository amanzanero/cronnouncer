import {
  AnnouncementError,
  AnnouncementInProgressError,
  AnnouncementNotInProgressError,
  ChannelDoesNotExistError,
  ValidationError,
} from "../../core/announcement/errors";
import { Message } from "discord.js";

interface ErrorActionProps {
  responseError: AnnouncementError;
  message: Message;
}

export function getActionFromError({ message, responseError }: ErrorActionProps) {
  switch (responseError.constructor) {
    case ValidationError:
      return () => message.channel.send(responseError.message);
    case AnnouncementInProgressError:
      return () =>
        message.channel.send("There is already an announcement in progress for this server.");
    case AnnouncementNotInProgressError:
      return () => message.channel.send("`There is no announcement in progress for this server.`");
    case ChannelDoesNotExistError:
      return () => message.channel.send(responseError.message);
    default:
      return () => Promise.resolve();
  }
}
