import { Channel, GuildID } from "../domain/announcement";
import { Client } from "discord.js";

export interface IDiscordService {
  textChannelExists(guildID: GuildID, channel: Channel): Promise<boolean>;
}

export class DiscordService implements IDiscordService {
  private client: Client;

  constructor(dClient: Client) {
    this.client = dClient;
  }

  async textChannelExists(guildID: GuildID, channel: Channel): Promise<boolean> {
    const guild = await this.client.guilds.fetch(guildID.value);
    const guildChannel = guild.channels.cache.get(channel.value);
    return !!guildChannel && guildChannel.isText();
  }
}
