import { Executor } from "./Executor";

export interface Command {
  execute: Executor;
  help: {
    name: string;
    category: string;
    description: string;
    usage: string;
  };
  conf: {
    enabled: boolean;
    guildOnly: boolean;
  };
}

export interface CommandMap {
  [command: string]: Command | undefined;
}
