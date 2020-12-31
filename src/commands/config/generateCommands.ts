import { Client } from "discord.js";
import { DbStores } from "../../infra/typeorm";
import { AnnouncementRepo } from "../../core/announcement/repos";
import { DiscordService } from "../../core/announcement/services/discord";

import { CommandMap } from "../definitions";
import { makeStartAnnouncementCMD } from "../start-announcement";
import { makeSetTimeCMD } from "../set-time";
import { makeHelpCMD } from "../help";
import { makeSetMessageCMD } from "../set-message";
import { makeSetChannelCMD } from "../set-channel";
import { makeCancelAnnouncementCMD } from "../cancel-announcement";

interface CMDProps {
  stores: DbStores;
  discordClient: Client;
}

export function generateCommands(cmdProps: CMDProps): CommandMap {
  const announcementRepo = new AnnouncementRepo(cmdProps.stores.announcementStore);
  const discordService = new DiscordService(cmdProps.discordClient);
  return {
    "cancel-announcement": makeCancelAnnouncementCMD({ announcementRepo }),
    help: makeHelpCMD(),
    "start-announcement": makeStartAnnouncementCMD({ announcementRepo }),
    "set-channel": makeSetChannelCMD({ announcementRepo, discordService }),
    "set-message": makeSetMessageCMD({ announcementRepo }),
    "set-time": makeSetTimeCMD({ announcementRepo }),
  };
}
