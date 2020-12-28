import "reflect-metadata";
import { createConnection, Repository } from "typeorm";
import { Announcement } from "./announcementModel";
import { logger } from "../../services";
import ormconfig from "./ormconfig";

export interface DbStores {
  announcementStore: Repository<Announcement>;
}

export async function initDB(): Promise<DbStores> {
  logger.info("initializing database...");
  const connection = await createConnection(ormconfig as any);
  const announcementStore = await connection.getRepository(Announcement);

  logger.info("database initialized");
  return { announcementStore };
}

export * from "./announcementModel";
