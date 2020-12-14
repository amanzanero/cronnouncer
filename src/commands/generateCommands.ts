import { CommandMap } from "./Command";

import ping from "./ping.cmd";

export function generateCommands(): CommandMap {
  return {
    ping,
  };
}
