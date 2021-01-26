import { EntityManager, getManager } from "typeorm";
import { GuildSettings } from "../domain/guildSettings";
import { Announcement } from "../domain/announcement";
import { AnnouncementStatus, Status } from "../domain/announcement/Status";
import { AnnouncementMap, GuildSettingsMap } from "../repos";
import { CONNECTION_NAME } from "../../../constants";

export interface AddAnnouncementIncrementCounterProps {
  guildID: string;
  guildSettings: GuildSettings;
  userID: string;
}

export interface IIdentifierService {
  addAnnouncementIncrementCounter(
    props: AddAnnouncementIncrementCounterProps,
  ): Promise<Announcement>;
}

export class IdentifierService implements IIdentifierService {
  private transactionManager: EntityManager;

  constructor() {
    this.transactionManager = getManager(CONNECTION_NAME);
  }

  async addAnnouncementIncrementCounter({
    userID,
    guildID,
    guildSettings,
  }: AddAnnouncementIncrementCounterProps) {
    const announcement = Announcement.create({
      guildID,
      shortID: guildSettings.nextShortID,
      status: Status.create(AnnouncementStatus.unscheduled).getValue(),
      userID,
    }).getValue();

    guildSettings.incShortID();

    await this.transactionManager.transaction(async (entityManager) => {
      await Promise.all([
        entityManager.save(AnnouncementMap.toPersistence(announcement)),
        entityManager.save(GuildSettingsMap.toPersistence(guildSettings)),
      ]);
    });
    return announcement;
  }
}
