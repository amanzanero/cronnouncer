import Discord from "discord.js";

export interface Command {
  execute:
    | ((client: Discord.Client, message: Discord.Message, args: string[]) => Promise<void>)
    | ((client: Discord.Client, message: Discord.Message) => Promise<void>);
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
