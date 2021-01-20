import { Message } from "discord.js";
import {
  AnnouncementError,
  AnnouncementIncompleteError,
  AnnouncementInProgressError,
  AnnouncementNotFoundError,
  AnnouncementNotInProgressError,
  InvalidTimeError,
  TextChannelDoesNotExistError,
  TimeInPastError,
  TimezoneNotSetError,
  ValidationError,
} from "../../core/announcement/errors";
import { logger } from "../../infra/logger";

import * as setTimeCMD from "../set-time";
import * as timezoneCMD from "../timezone";
import { PREFIX } from "../../constants";

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
    case AnnouncementNotFoundError:
      return () =>
        message.channel.send(
          `${responseError.message}\n> Type \`${PREFIX}help\` for proper usage.`,
        );
    case AnnouncementInProgressError:
      return () =>
        message.channel.send("There is already an announcement in progress for this server.");
    case AnnouncementNotInProgressError:
      return () => message.channel.send("There is no announcement in progress for this server.");
    case TimezoneNotSetError:
      return () =>
        message.channel.send(`${responseError.message}\n> Usage: \`${timezoneCMD.help.usage}\``);
    case InvalidTimeError:
      return () =>
        message.channel.send(`${responseError.message}\n> Usage: \`${setTimeCMD.help.usage}\``);
    default:
      return async () => {
        logger.error(`[UNHANDLED ERROR] ${responseError}`);
      };
  }
}
