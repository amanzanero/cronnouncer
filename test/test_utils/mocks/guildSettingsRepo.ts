import { IGuildSettingsRepo } from "../../../src/core/announcement/repos";
import { GuildSettings } from "../../../src/core/announcement/domain/guildSettings";

/**
 * Using in-memory for testing
 */
interface Datastore {
  [id: string]: GuildSettings | undefined;
}

export class MockGuildSettingsRepo implements IGuildSettingsRepo {
  private readonly datastore: Datastore;

  constructor() {
    this.datastore = {};
  }

  public async findByGuildID(guildID: string): Promise<GuildSettings | undefined> {
    return this.datastore[guildID];
  }

  public async findByGuildIDs(guildIDs: string[]) {
    return guildIDs.reduce((acc, gid) => {
      const settings = this.datastore[gid];
      if (!!settings) {
        acc[gid] = settings;
      }
      return acc;
    }, {} as { [guildID: string]: GuildSettings });
  }

  public async save(gs: GuildSettings) {
    const existing = this.datastore[gs.guildID];
    if (!existing) {
      this.datastore[gs.guildID] = gs;
    } else {
      this.datastore[gs.guildID] = existing.copy({
        timezone: gs.timezone,
        nextShortID: gs.nextShortID,
      });
    }
  }
}
