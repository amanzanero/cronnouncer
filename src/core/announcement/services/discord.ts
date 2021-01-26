import { Client } from "discord.js";

export interface IDiscordService {
  textChannelExists(guildID: string, channel: string): Promise<boolean>;
}

export class DiscordService implements IDiscordService {
  private client: Client;

  constructor(dClient: Client) {
    this.client = dClient;
  }

  async textChannelExists(guildID: string, channel: string): Promise<boolean> {
    const guild = await this.client.guilds.fetch(guildID);
    const guildChannel = guild.channels.cache.get(channel);
    return !!guildChannel && guildChannel.isText();
  }
}
