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
