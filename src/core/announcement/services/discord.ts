import { Channel, GuildID } from "../domain";
import { Client } from "discord.js";

export interface IDiscordService {
  channelExists(guildID: GuildID, channel: Channel): Promise<boolean>;
}

export class DiscordService implements IDiscordService {
  private client: Client;

  constructor(dClient: Client) {
    this.client = dClient;
  }

  async channelExists(guildID: GuildID, channel: Channel): Promise<boolean> {
    const guild = await this.client.guilds.fetch(guildID.value);
    return guild.channels.cache.some((cachedChannel) => cachedChannel.id === channel.value);
  }
}
