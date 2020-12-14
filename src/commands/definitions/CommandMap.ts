import { Command } from "./Command";

export interface CommandMap {
  [command: string]: Command | undefined;
}
