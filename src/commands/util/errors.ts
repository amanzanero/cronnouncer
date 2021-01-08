import {
  AnnouncementError,
  AnnouncementIncompleteError,
  AnnouncementInProgressError,
  AnnouncementNotInProgressError,
  InvalidTimeError,
  TextChannelDoesNotExistError,
  TimeInPastError,
  TimezoneNotSetError,
  ValidationError,
} from "../../core/announcement/errors";
import { Message } from "discord.js";
import { logger } from "../../util";

import * as setTimeCMD from "../set-time";
import * as timezoneCMD from "../timezone";

interface ErrorActionProps {
  responseError: AnnouncementError;
  message: Message;
}

export function getActionFromError({ message, responseError }: ErrorActionProps) {
  switch (responseError.constructor) {
    case ValidationError:
    case AnnouncementIncompleteError:
    case TextChannelDoesNotExistError:
    case TimeInPastError:
      return () => message.channel.send(responseError.message);
    case AnnouncementInProgressError:
      return () =>
        message.channel.send("There is already an announcement in progress for this server.");
    case AnnouncementNotInProgressError:
      return () => message.channel.send("`There is no announcement in progress for this server.`");
    case TimezoneNotSetError:
      return () =>
        message.channel.send(`${responseError.message}\nUsage: ${timezoneCMD.help.usage}`);
    case InvalidTimeError:
      return () =>
        message.channel.send(`${responseError.message}\nUsage: ${setTimeCMD.help.usage}`);
    default:
      return async () => {
        logger.error(`[UNHANDLED ERROR] ${responseError}`);
      };
  }
}
