import { CommandMap } from "../definitions";

import ping from "../ping";

export function generateCommands(): CommandMap {
  return {
    ping,
  };
}
