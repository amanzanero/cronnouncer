import { AnnouncementRepo, AnnouncementSettingsRepo } from "../core/announcement/repos";
import { DiscordService } from "../core/announcement/services/discord";

import { Command, CommandMap, CMD } from "./definitions";
import { makeExecuteBase } from "./executeBase";
import { makeHelpCMD } from "./help";
import * as startAnnouncementCMD from "./create";
import * as setTimeCMD from "./set-time";
import * as setMessageCMD from "./set-message";
import * as setChannelCMD from "./set-channel";
import * as cancelAnnouncementCMD from "./unschedule";
import * as scheduleAnnouncementCMD from "./schedule";
import * as timezoneCMD from "./timezone";
import * as deleteCMD from "./delete";
import { CronService } from "../core/announcement/services/cron";
import { TimeService } from "../core/announcement/services/time";
import { LoggerService } from "../core/announcement/services/logger";

interface CMDProps {
  announcementRepo: AnnouncementRepo;
  announcementSettingsRepo: AnnouncementSettingsRepo;
  cronService: CronService;
  discordService: DiscordService;
  loggerService: LoggerService;
  timeService: TimeService;
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
