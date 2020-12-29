import { DATABASE_URL, PG_DB, PG_HOST, PG_PASSWORD, PG_PORT, PG_USER } from "../../constants";
import { Announcement } from "./announcementModel";

function makeOrmconfig() {
  const baseOptions = {
    type: "postgres",
    entities: [Announcement],
    logging: false,
    cli: {
      migrationsDir: "src/infra/typeorm/migrations",
    },
  };

  return [
    {
      name: "default",
      ssl: { rejectUnauthorized: false },
      url: DATABASE_URL,
      synchronize: false,
      ...baseOptions,
    },
    {
      name: "dev",
      host: PG_HOST,
      port: PG_PORT,
      username: PG_USER,
      password: PG_PASSWORD,
      database: PG_DB,
      synchronize: true,
      ...baseOptions,
    },
  ];
}

export default makeOrmconfig();
