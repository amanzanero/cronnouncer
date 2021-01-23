import { Message } from "discord.js";
import {
  AnnouncementError,
  AnnouncementIncompleteError,
  AnnouncementLockedStatusError,
  AnnouncementNotFoundError,
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
    case AnnouncementLockedStatusError:
      return () =>
        message.channel.send(
          `${responseError.message}\n> Type \`${PREFIX}help\` for proper usage.`,
        );
    case TimezoneNotSetError:
      return () =>
        message.channel.send(`${responseError.message}\n> Usage: \`${timezoneCMD.help.usage}\``);
    case InvalidTimeError:
      return () =>
        message.channel.send(`${responseError.message}\n> Usage: \`${setTimeCMD.help.usage}\``);

    /* istanbul ignore next */
    default:
      return async () => {
        logger.error(`[UNHANDLED ERROR] ${responseError}`);
      };
  }
}

export const INTERNAL_ERROR_RESPONSE = "Sorry! Something unexpected happened on my end :(";
