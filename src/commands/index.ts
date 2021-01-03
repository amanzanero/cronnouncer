import { PREFIX } from "../constants";

export const UNKNOWN_COMMAND_RESPONSE = `Sorry I didn't understand that command.\nFor a list of commands, run \`${PREFIX}help\`.`;

export * from "./messageHandler";
export * from "./cmd";
