import { Client } from "discord.js";
import { DbStores } from "../infra/typeorm";
import { AnnouncementRepo, AnnouncementSettingsRepo } from "../core/announcement/repos";
import { DiscordService } from "../core/announcement/services/discord";

import { Command, CommandMap, CMD } from "./definitions";
import { makeExecuteBase } from "./executeBase";
import { makeHelpCMD } from "./help";
import * as startAnnouncementCMD from "./start-announcement";
import * as setTimeCMD from "./set-time";
import * as setMessageCMD from "./set-message";
import * as setChannelCMD from "./set-channel";
import * as cancelAnnouncementCMD from "./cancel-announcement";
import * as publishAnnouncementCMD from "./publish";
import * as timezoneCMD from "./timezone";
import { CronService } from "../core/announcement/services/cron";
import { TimeService } from "../core/announcement/services/time";

interface CommandMapProps {
  stores: DbStores;
  discordClient: Client;
}

export function makeCommandMap(commandMapProps: CommandMapProps): CommandMap {
  const announcementRepo = new AnnouncementRepo(commandMapProps.stores.announcementStore);
  const announcementSettingsRepo = new AnnouncementSettingsRepo(
    commandMapProps.stores.announcementSettingsStore,
  );
  const cronService = new CronService(commandMapProps.discordClient);
  const discordService = new DiscordService(commandMapProps.discordClient);
  const timeService = new TimeService();

  const cmdProps = {
    announcementRepo,
    announcementSettingsRepo,
    cronService,
    discordService,
    timeService,
  };

  return {
    help: makeHelpCMD(),
    timezone: makeCMD(cmdProps, timezoneCMD),
    "cancel-announcement": makeCMD(cmdProps, cancelAnnouncementCMD),
    "start-announcement": makeCMD(cmdProps, startAnnouncementCMD),
    "set-channel": makeCMD(cmdProps, setChannelCMD),
    "set-message": makeCMD(cmdProps, setMessageCMD),
    "set-time": makeCMD(cmdProps, setTimeCMD),
    publish: makeCMD(cmdProps, publishAnnouncementCMD),
  };
}

interface CMDProps {
  announcementRepo: AnnouncementRepo;
  announcementSettingsRepo: AnnouncementSettingsRepo;
  cronService: CronService;
  discordService: DiscordService;
  timeService: TimeService;
}

function makeCMD(props: CMDProps, cmd: CMD): Command {
  return {
    execute: makeExecuteBase(props, cmd),
    help: cmd.help,
    conf: cmd.conf,
  };
}
