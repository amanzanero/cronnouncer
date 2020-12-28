import { CommandMap } from "../definitions";
import { makePing } from "../ping";
import { makeSchedule } from "../schedule";
import { DbStores } from "../../infra/typeorm";
import { makeAnnouncementRepo } from "../../core/announcement/repos";

export function generateCommands(dbStores: DbStores): CommandMap {
  const announcementRepo = makeAnnouncementRepo(dbStores.announcementStore);
  return {
    ping: makePing(),
    schedule: makeSchedule({ announcementRepo }),
  };
}
