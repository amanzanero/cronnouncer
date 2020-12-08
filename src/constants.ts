// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

export const IS_PROD = process.env.NODE_ENV === "production";
export const IS_TEST = process.env.NODE_ENV === "test";
export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
export const DEBUG = !IS_PROD && false; // make this true if you want debug mode on
export const PREFIX = IS_PROD || IS_TEST ? "!" : "!dev-";
