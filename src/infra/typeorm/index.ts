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
  logger.info("connecting to database...");
  const [prodConfig, devConfig] = ormconfig;
  const connection = await createConnection((IS_PROD ? prodConfig : devConfig) as any);
  const announcementStore = await connection.getRepository(Announcement);

  logger.info("connected to database successfully");
  return { announcementStore };
}

export * from "./announcementModel";
