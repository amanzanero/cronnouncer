import "reflect-metadata";
import { createConnection, Repository } from "typeorm";
import { Announcement, AnnouncementSettings } from "./models";
import { logger } from "../logger";
import ormconfig from "./ormconfig";
import { DATABASE_URL } from "../../constants";

export interface DbStores {
  announcementStore: Repository<Announcement>;
  announcementSettingsStore: Repository<AnnouncementSettings>;
}

export async function initDB(): Promise<{
  stores: DbStores;
  storesDisconnect: () => Promise<void>;
}> {
  logger.info("connecting to database...");
  const [prodConfig, localConfig] = ormconfig;
  let config;
  if (!!DATABASE_URL) {
    config = prodConfig;
    logger.info("[initDB] using prodConfig");
  } else {
    config = localConfig;
    logger.info("[initDB] using localConfig");
  }

  const connection = await createConnection(config as any);
  const [announcementStore, announcementSettingsStore] = await Promise.all([
    connection.getRepository(Announcement),
    connection.getRepository(AnnouncementSettings),
  ]);

  logger.info("connected to database successfully");
  return {
    stores: {
      announcementStore,
      announcementSettingsStore,
    },
    storesDisconnect: () => connection.close(),
  };
}
