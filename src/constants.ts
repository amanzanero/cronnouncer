// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

export const IS_PROD = process.env.NODE_ENV === "production";
export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
export const PREFIX = process.env.PREFIX as string;
export const MAX_MESSAGE_SIZE = 1000;

export const PG_HOST = process.env.PG_HOST;
export const PG_PORT = process.env.PG_PORT;
export const PG_USER = process.env.PG_USER;
export const PG_PASSWORD = process.env.PG_PASSWORD;
export const PG_DB = process.env.PG_DB;
export const DATABASE_URL = process.env.DATABASE_URL;

export const GCLOUD_PROJECT_ID = process.env.GCLOUD_PROJECT_ID;
export const CONNECTION_NAME = !!DATABASE_URL ? "default" : "local";
export const SERVICE_KEYFILE = process.env.SERVICE_KEYFILE;

export const SUPPORTED_TIMEZONES = [
  "US/Alaska",
  "US/Aleutian",
  "US/Arizona",
  "US/Central",
  "US/East-Indiana",
  "US/Eastern",
  "US/Hawaii",
  "US/Indiana-Starke",
  "US/Michigan",
  "US/Mountain",
  "US/Pacific",
  "US/Samoa",
];
