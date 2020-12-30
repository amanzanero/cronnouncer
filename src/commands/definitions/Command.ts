import Discord from "discord.js";
import { Args } from "../config/Args";

export type Executor =
  | ((client: Discord.Client, message: Discord.Message, args: Args) => Promise<void>)
  | ((client: Discord.Client, message: Discord.Message) => Promise<void>);

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
