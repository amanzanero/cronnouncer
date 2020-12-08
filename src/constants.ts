// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

export const IS_PROD = process.env.NODE_ENV === "production";
export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
