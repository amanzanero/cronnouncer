import Discord from "discord.js";
import { initDB } from "../infra/typeorm";
import { AnnouncementRepo, GuildSettingsRepo } from "../core/announcement/repos";
import { CronService } from "../core/announcement/services/cron";
import { DiscordService } from "../core/announcement/services/discord";
import { LoggerService } from "../core/announcement/services/logger";
import { TimeService } from "../core/announcement/services/time";
import { IdentifierService } from "../core/announcement/services/identifierService";

export async function onStartup() {
  const { stores, storesDisconnect } = await initDB();
  const discordClient = new Discord.Client();

  const announcementRepo = new AnnouncementRepo(stores.announcementStore);
  const guildSettingsRepo = new GuildSettingsRepo(stores.guildSettingsStore);
  const cronService = new CronService(discordClient);
  const discordService = new DiscordService(discordClient);
  const loggerService = new LoggerService();
  const timeService = new TimeService();
  const identifierService = new IdentifierService();

  return {
    discordClient,
    stores, // for straight up crud
    storesDisconnect,

    announcementRepo,
    guildSettingsRepo,
    cronService,
    discordService,
    loggerService,
    timeService,
    identifierService,
  };
}
