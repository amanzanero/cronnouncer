import { PREFIX } from "../constants";
import { ExecutorProps } from "./definitions";
import { Repository } from "typeorm";
import { Announcement as AnnouncementModel } from "../infra/typeorm/models";
import { logger } from "../infra/logger";

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

interface ListProps {
  announcementTORepo: Repository<AnnouncementModel>;
}

let startString = `Status      ID                                   Created at\n`;
startString = `${startString}\n${"".padEnd(startString.length, "-")}\n`;

function tableFormatter(acc: string, curr: AnnouncementModel) {
  return `${acc}${curr.status.padEnd(8)} ${curr.announcement_id} ${curr.created_at}\n`;
}

// no need to access core for this
export function makeListExecute({ announcementTORepo }: ListProps) {
  async function execute({ requestID, message }: ExecutorProps) {
    const meta = { requestID, user: message.author.tag };

    try {
      const announcements = await announcementTORepo.find({ guild_id: message.guild?.id });

      let response;
      if (announcements.length) {
        response = announcements.reduce(tableFormatter, startString);
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
