import moment from "moment-timezone";
import { getConnection } from "typeorm";
import { Guild } from "discord.js";

import { CONNECTION_NAME, MAX_MESSAGE_SIZE, PREFIX } from "../constants";
import {
  Announcement as AnnouncementModel,
  GuildSettings as GuildSettingsModel,
} from "../infra/typeorm/models";
import { logger } from "../infra/logger";
import { DATE_FORMAT } from "../core/announcement/services/cron";
import { ExecutorProps } from "./definitions";
import { INTERNAL_ERROR_RESPONSE } from "./util/errors";

export const help = {
  name: "list",
  category: "Scheduling",
  description: "Lists all unscheduled, scheduled, and sent announcements",
  usage: `${PREFIX}list`,
  example: `${PREFIX}list`,
};

export const conf = {
  enabled: true,
  guildOnly: true,
};

const startString = `announcementID| Status       | Created at        \n`;
const divider = "".padEnd(startString.length, "-") + "\n";

export function announcementsTable(
  announcements: AnnouncementModel[],
  timezone?: string,
): string[] {
  const responses: string[] = [];
  let response = startString;
  if (announcements.length && !!timezone) {
    announcements.forEach((curr) => {
      const parsedTime = moment.tz(curr.created_at, timezone).format(DATE_FORMAT);
      const id = curr.short_id.toString().padEnd(14);
      const status = curr.status.padEnd(13);

      const nextRow = divider + `${id}| ${status}| ${parsedTime}\n`;
      if (response.length + nextRow.length > MAX_MESSAGE_SIZE) {
        responses.push(`\`\`\`${response}\`\`\``);
        response = startString;
      }
      response += nextRow;
    });
    responses.push(`\`\`\`${response}\`\`\``);
  } else {
    responses.push("There are no announcements created for this server.");
  }
  return responses;
}

// no need to access core for this
export function makeListCMD() {
  const connection = getConnection(CONNECTION_NAME);
  const announcementTORepo = connection.getRepository(AnnouncementModel);
  const guildSettingsTORepo = connection.getRepository(GuildSettingsModel);

  async function execute({ meta, message }: ExecutorProps) {
    try {
      const guild_id = (message.guild as Guild).id;
      const [announcements, guildSettings] = await Promise.all([
        announcementTORepo.find({ guild_id }),
        guildSettingsTORepo.findOne({ guild_id }),
      ]);

      const responses = announcementsTable(announcements, guildSettings?.timezone);
      for (const response of responses) {
        await message.channel.send(response);
      }
      logger.info(`Sent ${announcements.length} announcements`, meta);
    } catch (e) {
      logger.error(e, meta);
      await message.channel.send(INTERNAL_ERROR_RESPONSE);
    }
  }

  return {
    execute,
    help,
    conf,
  };
}
