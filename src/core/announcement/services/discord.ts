import { Channel, GuildID } from "../domain";

export interface IDiscordService {
  channelExists(guildID: GuildID, channel: Channel): Promise<boolean>;
}
