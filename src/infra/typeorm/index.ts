import "reflect-metadata";
import { createConnection, Repository } from "typeorm";
import { Announcement } from "./announcementModel";
import { logger } from "../../services";
import ormconfig from "./ormconfig";
import { IS_PROD } from "../../constants";

export interface DbStores {
  announcementStore: Repository<Announcement>;
}

export async function initDB(): Promise<DbStores> {
  logger.info("initializing database...");
  const [prodConfig, devConfig] = ormconfig;
  const connection = await createConnection((IS_PROD ? prodConfig : devConfig) as any);
  const announcementStore = await connection.getRepository(Announcement);

  logger.info("database initialized");
  return { announcementStore };
}

export * from "./announcementModel";
