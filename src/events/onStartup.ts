import { initDB } from "../infra/typeorm";
import Discord from "discord.js";
import { AnnouncementRepo, AnnouncementSettingsRepo } from "../core/announcement/repos";
import { CronService } from "../core/announcement/services/cron";
import { DiscordService } from "../core/announcement/services/discord";
import { TimeService } from "../core/announcement/services/time";

export async function onStartup() {
  const { stores, storesDisconnect } = await initDB();
  const discordClient = new Discord.Client();

  const announcementRepo = new AnnouncementRepo(stores.announcementStore);
  const announcementSettingsRepo = new AnnouncementSettingsRepo(stores.announcementSettingsStore);
  const cronService = new CronService(discordClient);
  const discordService = new DiscordService(discordClient);
  const timeService = new TimeService();

  return {
    discordClient,
    storesDisconnect,

    announcementRepo,
    announcementSettingsRepo,
    cronService,
    discordService,
    timeService,
  };
}
