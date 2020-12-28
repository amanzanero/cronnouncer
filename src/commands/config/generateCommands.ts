import { CommandMap } from "../definitions";
import { makeStartAnnouncementCMD } from "../start-announcement";
import { DbStores } from "../../infra/typeorm";
import { makeAnnouncementRepo } from "../../core/announcement/repos";
import { makeSetTimeCMD } from "../set-time";

export function generateCommands(dbStores: DbStores): CommandMap {
  const announcementRepo = makeAnnouncementRepo(dbStores.announcementStore);
  return {
    "start-announcement": makeStartAnnouncementCMD({ announcementRepo }),
    "set-time": makeSetTimeCMD({ announcementRepo }),
  };
}
