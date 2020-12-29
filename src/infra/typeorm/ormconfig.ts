import { DATABASE_URL, PG_DB, PG_HOST, PG_PASSWORD, PG_PORT, PG_USER } from "../../constants";
import { Announcement } from "./announcementModel";

const baseOptions = {
  type: "postgres",
  entities: [Announcement],
  synchronize: false,
  migrations: ["build/infra/typeorm/migrations/*.ts"],
  cli: {
    migrationsDir: "src/infra/typeorm/migrations",
  },
};

export default [
  {
    name: "default",
    ssl: { rejectUnauthorized: false },
    url: DATABASE_URL,
    ...baseOptions,
  },
  {
    name: "dev",
    host: PG_HOST,
    port: PG_PORT,
    username: PG_USER,
    password: PG_PASSWORD,
    database: PG_DB,
    ...baseOptions,
  },
];
