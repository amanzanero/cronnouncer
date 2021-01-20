import moment from "moment-timezone";
import { getConnection } from "typeorm";
import { CONNECTION_NAME, PREFIX } from "../constants";
import {
  Announcement as AnnouncementModel,
  GuildSettings as GuildSettingsModel,
} from "../infra/typeorm/models";
import { logger } from "../infra/logger";
import { DATE_FORMAT } from "../core/announcement/services/cron";
import { ExecutorProps } from "./definitions";

export const help = {
  name: "list",
  category: "Scheduling",
  description: "lists all unscheduled, scheduled, and sent announcements.",
  usage: `${PREFIX}list`,
  example: `${PREFIX}list`,
};

export const conf = {
  enabled: true,
  guildOnly: true,
};

let startString = `ID        Status       Created at        \n`;
startString = `${startString}\n${"".padEnd(startString.length, "-")}\n`;

// no need to access core for this
export function makeListExecute() {
  const connection = getConnection(CONNECTION_NAME);
  const announcementTORepo = connection.getRepository(AnnouncementModel);
  const guildSettingsTORepo = connection.getRepository(GuildSettingsModel);

  async function execute({ requestID, message }: ExecutorProps) {
    const meta = { requestID, user: message.author.tag };

    try {
      const [announcements, guildSettings] = await Promise.all([
        announcementTORepo.find({ guild_id: message.guild?.id }),
        guildSettingsTORepo.findOne({ guild_id: message.guild?.id }),
      ]);

      let response;
      if (announcements.length && !!guildSettings) {
        response = announcements.reduce((acc, curr) => {
          const parsedTime = moment.tz(curr.created_at, guildSettings.timezone).format(DATE_FORMAT);
          const id = curr.short_id.toString().padEnd(9);
          const status = curr.status.padEnd(8);
          return `${acc}${id} ${status}  ${parsedTime}\n`;
        }, startString);
        response = `\`\`\`${response}\`\`\``;
      } else {
        response = "There are no announcements created for this server at this time.";
      }
      await message.channel.send(response);
      logger.info(`Sent ${announcements.length} announcements`, meta);
    } catch (e) {
      logger.error(e, meta);
    }
  }

  return {
    execute,
    help,
    conf,
  };
}
