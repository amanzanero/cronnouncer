// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

export const IS_PROD = process.env.NODE_ENV === "production";
export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
export const PREFIX = IS_PROD ? "!" : "#";

export const PG_HOST = process.env.PG_HOST;
export const PG_PORT = process.env.PG_PORT;
export const PG_USER = process.env.PG_USER;
export const PG_PASSWORD = process.env.PG_PASSWORD;
export const PG_DB = process.env.PG_DB;
