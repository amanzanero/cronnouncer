import { Client } from "discord.js";
import { Map } from "immutable";
import { AnnouncementRepo, GuildSettingsRepo } from "../core/announcement/repos";
import { DiscordService } from "../core/announcement/services/discord";

import { CronService } from "../core/announcement/services/cron";
import { TimeService } from "../core/announcement/services/time";
import { LoggerService } from "../core/announcement/services/logger";
import { PREFIX } from "../constants";
import { DbStores } from "../infra/typeorm";
import { IdentifierService } from "../core/announcement/services/identifierService";
import { Command, CoreInteractionCommand } from "./definitions";
import { makeCoreInteractionExecutor } from "./base/executeCoreInteraction";
import { makeHelpCMD } from "./help";
import * as startAnnouncementCoreCMD from "./create";
import * as setTimeCoreCMD from "./set-time";
import * as setMessageCoreCMD from "./set-message";
import * as setChannelCoreCMD from "./set-channel";
import * as cancelAnnouncementCoreCMD from "./unschedule";
import * as scheduleAnnouncementCMD from "./schedule";
import * as timezoneCoreCMD from "./timezone";
import * as deleteCoreCMD from "./delete";
import { makeListCMD } from "./list";
import { makeViewCMD } from "./view";
import { makePingCMD } from "./ping";

export const UNKNOWN_COMMAND_RESPONSE = `Sorry I didn't understand that command.\nFor a list of commands, run \`${PREFIX}help\`.`;

export interface CMDProps {
  announcementRepo: AnnouncementRepo;
  guildSettingsRepo: GuildSettingsRepo;
  cronService: CronService;
  discordService: DiscordService;
  loggerService: LoggerService;
  timeService: TimeService;
  identifierService: IdentifierService;

  stores: DbStores; // for crud
  discordClient: Client;
}

export function makeCommandMap(cmdProps: CMDProps): Map<string, Command> {
  return Map({
    /**
     * commands that utilize core
     */
    timezone: makeCoreInteractionCMD(cmdProps, timezoneCoreCMD),
    create: makeCoreInteractionCMD(cmdProps, startAnnouncementCoreCMD),
    "set-channel": makeCoreInteractionCMD(cmdProps, setChannelCoreCMD),
    "set-message": makeCoreInteractionCMD(cmdProps, setMessageCoreCMD),
    "set-time": makeCoreInteractionCMD(cmdProps, setTimeCoreCMD),
    schedule: makeCoreInteractionCMD(cmdProps, scheduleAnnouncementCMD),
    unschedule: makeCoreInteractionCMD(cmdProps, cancelAnnouncementCoreCMD),
    delete: makeCoreInteractionCMD(cmdProps, deleteCoreCMD),

    /**
     * basic CRUD / non-core commands
     */
    list: makeListCMD(),
    view: makeViewCMD(),
    ping: makePingCMD(cmdProps),
    help: makeHelpCMD(),
  });
}

/**
 * Assembles an execution function with other cmd props
 */
function makeCoreInteractionCMD(props: CMDProps, cmd: CoreInteractionCommand): Command {
  return {
    execute: makeCoreInteractionExecutor(props, cmd),
    help: cmd.help,
    conf: cmd.conf,
  };
}
