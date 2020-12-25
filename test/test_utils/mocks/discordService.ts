import { IDiscordService } from "../../../src/core/announcement/services/discord";
import { Channel, GuildID } from "../../../src/core/announcement/domain";

export class MockDiscordService implements IDiscordService {
  public channels: { [channel: string]: boolean | undefined };

  constructor() {
    this.channels = {};
  }

  async channelExists(_: GuildID, channel: Channel): Promise<boolean> {
    return !!this.channels[channel.value];
  }
}
