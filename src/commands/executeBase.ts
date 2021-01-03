import { Message } from "discord.js";
import { AnnouncementError } from "../core/announcement/errors";
import { getActionFromError } from "./util/errors";
import { logger } from "../util";
import { Response } from "../lib";
import { AnnouncementOutput } from "../core/announcement/interactions/common";
import { Args } from "./definitions/Args";
import { Executor, Interaction, Success } from "./definitions";
import { IAnnouncementRepo } from "../core/announcement/repos";
import { IDiscordService } from "../core/announcement/services/discord";

interface ExecuteBaseProps {
  interaction: Interaction;
  onSuccess: Success;
}

interface ExecuteBaseDependencies {
  announcementRepo: IAnnouncementRepo;
  discordService: IDiscordService;
}

export function makeExecuteBase(
  dependencies: ExecuteBaseDependencies,
  execProps: ExecuteBaseProps,
): Executor {
  return async function execute(message: Message, args: Args) {
    const { interaction, onSuccess } = execProps;
    try {
      const response = await interaction(dependencies, message, args);

      if (response.failed) {
        const responseError = response.value as AnnouncementError;
        const action = getActionFromError({ message, responseError });
        await action();
        return;
      }

      await onSuccess(message, response as Response<AnnouncementOutput>);
    } catch (e) {
      logger.error(e.stack);
    }
  };
}
