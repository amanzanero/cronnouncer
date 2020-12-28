import { PG_DB, PG_HOST, PG_PASSWORD, PG_PORT, PG_USER } from "../../constants";
import { Announcement } from "./announcementModel";

export = {
  type: "postgres",
  host: PG_HOST,
  port: PG_PORT,
  username: PG_USER,
  password: PG_PASSWORD,
  database: PG_DB,
  entities: [Announcement],
  synchronize: false,
  logging: false,
  migrations: ["src/infra/typeorm/migrations/*.ts"],
  cli: {
    migrationsDir: "src/infra/typeorm/migrations",
  },
};
