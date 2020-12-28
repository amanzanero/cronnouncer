import { AnnouncementRepo } from "./AnnouncementRepo";
import { Repository } from "typeorm";
import { Announcement as AnnouncementModel } from "../../../infra/typeorm";

export function makeAnnouncementRepo(typeormRepo: Repository<AnnouncementModel>) {
  return new AnnouncementRepo(typeormRepo);
}
