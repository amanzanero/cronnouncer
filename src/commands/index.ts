import { AnnouncementRepo, AnnouncementSettingsRepo } from "../core/announcement/repos";
import { DiscordService } from "../core/announcement/services/discord";

import { Command, CommandMap, CMD } from "./definitions";
import { makeExecuteBase } from "./base/executeBase";
import { makeHelpCMD } from "./help";
import * as startAnnouncementCMD from "./create";
import * as setTimeCMD from "./set-time";
import * as setMessageCMD from "./set-message";
import * as setChannelCMD from "./set-channel";
import * as cancelAnnouncementCMD from "./unschedule";
import * as scheduleAnnouncementCMD from "./schedule";
import * as timezoneCMD from "./timezone";
import * as deleteCMD from "./delete";
import { makeListExecute } from "./list";
import { CronService } from "../core/announcement/services/cron";
import { TimeService } from "../core/announcement/services/time";
import { LoggerService } from "../core/announcement/services/logger";

import { PREFIX } from "../constants";
import { DbStores } from "../infra/typeorm";

export const UNKNOWN_COMMAND_RESPONSE = `Sorry I didn't understand that command.\nFor a list of commands, run \`${PREFIX}help\`.`;

interface CMDProps {
  announcementRepo: AnnouncementRepo;
  announcementSettingsRepo: AnnouncementSettingsRepo;
  cronService: CronService;
  discordService: DiscordService;
  loggerService: LoggerService;
  timeService: TimeService;

  stores: DbStores; // for crud
}

export function makeCommandMap(cmdProps: CMDProps): CommandMap {
  return {
    help: makeHelpCMD(),
    timezone: makeCMD(cmdProps, timezoneCMD),
    create: makeCMD(cmdProps, startAnnouncementCMD),
    "set-channel": makeCMD(cmdProps, setChannelCMD),
    "set-message": makeCMD(cmdProps, setMessageCMD),
    "set-time": makeCMD(cmdProps, setTimeCMD),
    schedule: makeCMD(cmdProps, scheduleAnnouncementCMD),
    unschedule: makeCMD(cmdProps, cancelAnnouncementCMD),
    list: makeListExecute({ announcementTORepo: cmdProps.stores.announcementStore }),
    delete: makeCMD(cmdProps, deleteCMD),
  };
}

function makeCMD(props: CMDProps, cmd: CMD): Command {
  return {
    execute: makeExecuteBase(props, cmd),
    help: cmd.help,
    conf: cmd.conf,
  };
}
