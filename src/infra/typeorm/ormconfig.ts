import {
  DATABASE_URL,
  IS_PROD,
  PG_DB,
  PG_HOST,
  PG_PASSWORD,
  PG_PORT,
  PG_USER,
} from "../../constants";
import { Announcement } from "./announcementModel";

function makeOrmconfig() {
  const baseOptions = {
    type: "postgres",
    entities: [Announcement],
    synchronize: false,
    logging: false,
    extra: {
      ssl: IS_PROD,
    },
    migrations: ["src/infra/typeorm/migrations/*.ts"],
    cli: {
      migrationsDir: "src/infra/typeorm/migrations",
    },
  };

  if (DATABASE_URL) {
    // use DB URL if available
    Object.assign(baseOptions, { url: DATABASE_URL });
  } else {
    Object.assign(baseOptions, {
      host: PG_HOST,
      port: PG_PORT,
      username: PG_USER,
      password: PG_PASSWORD,
      database: PG_DB,
    });
  }

  return baseOptions;
}

export = makeOrmconfig();
