import { AnnouncementError } from "../core/announcement/errors";
import { getActionFromError } from "./util/errors";
import { Response } from "../lib";
import { AnnouncementOutput } from "../core/announcement/interactions/common";
import { Executor, Interaction, Success } from "./definitions";
import { IAnnouncementRepo, IAnnouncementSettingsRepo } from "../core/announcement/repos";
import { ICronService } from "../core/announcement/services/cron";
import { IDiscordService } from "../core/announcement/services/discord";
import { ILoggerService } from "../core/announcement/services/logger";
import { ITimeService } from "../core/announcement/services/time";

interface ExecuteBaseProps {
  interaction: Interaction;
  onSuccess: Success;
}

interface ExecuteBaseDependencies {
  announcementRepo: IAnnouncementRepo;
  announcementSettingsRepo: IAnnouncementSettingsRepo;
  discordService: IDiscordService;
  cronService: ICronService;
  loggerService: ILoggerService;
  timeService: ITimeService;
}

export function makeExecuteBase(
  dependencies: ExecuteBaseDependencies,
  execProps: ExecuteBaseProps,
): Executor {
  return async function execute({ requestID, args, message }) {
    const { interaction, onSuccess } = execProps;
    try {
      const interactionDeps = { ...dependencies, requestID };
      const response = await interaction(interactionDeps, message, args);

      if (response.failed) {
        const responseError = response.value as AnnouncementError;
        const action = getActionFromError({ message, responseError });
        await action();
        return;
      }
      await onSuccess(message, response as Response<AnnouncementOutput>);
    } catch (e) {
      dependencies.loggerService.error(e, { requestID });

      message.channel.send("Sorry! Something unexpected happened on my end :(").catch((e) => {
        dependencies.loggerService.error(e, { requestID });
      });
    }
  };
}
