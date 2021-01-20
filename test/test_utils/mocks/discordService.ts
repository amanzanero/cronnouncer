import { IDiscordService } from "../../../src/core/announcement/services/discord";

export class MockDiscordService implements IDiscordService {
  public channels: { [channel: string]: boolean | undefined };

  constructor() {
    this.channels = {};
  }

  async textChannelExists(_: string, channelID: string): Promise<boolean> {
    return !!this.channels[channelID];
  }
}
