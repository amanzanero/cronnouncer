import { AnnouncementError } from "../../core/announcement/errors";
import { getActionFromError, INTERNAL_ERROR_RESPONSE } from "../util/errors";
import { Response } from "../../core/lib";
import { AnnouncementOutput } from "../../core/announcement/interactions/common";
import { Executor, Interaction, Success } from "../definitions";
import { IAnnouncementRepo, IGuildSettingsRepo } from "../../core/announcement/repos";
import { ICronService } from "../../core/announcement/services/cron";
import { IDiscordService } from "../../core/announcement/services/discord";
import { ILoggerService } from "../../core/announcement/services/logger";
import { ITimeService } from "../../core/announcement/services/time";
import { IIdentifierService } from "../../core/announcement/services/identifierService";

interface ExecuteCoreInteractionProps {
  interaction: Interaction;
  onSuccess: Success;
}

interface ExecuteBaseDependencies {
  announcementRepo: IAnnouncementRepo;
  guildSettingsRepo: IGuildSettingsRepo;
  discordService: IDiscordService;
  cronService: ICronService;
  loggerService: ILoggerService;
  timeService: ITimeService;
  identifierService: IIdentifierService;
}

export function makeCoreInteractionExecutor(
  dependencies: ExecuteBaseDependencies,
  execProps: ExecuteCoreInteractionProps,
): Executor {
  return async function execute({ meta, args, message }) {
    const { interaction, onSuccess } = execProps;
    try {
      const interactionDeps = { ...dependencies, meta };
      const response = await interaction(interactionDeps, message, args);

      if (response.failed) {
        const responseError = response.value as AnnouncementError;
        const action = getActionFromError({ message, responseError });
        await action();
        return;
      }
      await onSuccess(message, response as Response<AnnouncementOutput>);
    } catch (e) {
      dependencies.loggerService.error(e, meta);

      message.channel.send(INTERNAL_ERROR_RESPONSE).catch((e) => {
        dependencies.loggerService.error(e, meta);
      });
    }
  };
}
