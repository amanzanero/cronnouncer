import "reflect-metadata";
import { createConnection, Repository } from "typeorm";
import { logger } from "../logger";
import { DATABASE_URL } from "../../constants";
import { Announcement, GuildSettings } from "./models";
import ormconfig from "./ormconfig";

export interface DbStores {
  announcementStore: Repository<Announcement>;
  guildSettingsStore: Repository<GuildSettings>;
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
  const [announcementStore, guildSettingsStore] = await Promise.all([
    connection.getRepository(Announcement),
    connection.getRepository(GuildSettings),
  ]);

  logger.info("connected to database successfully");
  return {
    stores: {
      announcementStore,
      guildSettingsStore,
    },
    storesDisconnect: async () => {
      await connection.close();
      logger.info("[storesDisconnect] disconnected from database");
    },
  };
}
