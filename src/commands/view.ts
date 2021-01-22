import { getConnection } from "typeorm";
import { CONNECTION_NAME, PREFIX } from "../constants";
import { Announcement as AnnouncementModel } from "../infra/typeorm/models";
import { logger } from "../infra/logger";
import { Guard } from "../core/lib";
import { ExecutorProps } from "./definitions";
import { announcementStringEmbed } from "./util/announcementString";
import { INTERNAL_ERROR_RESPONSE } from "./util/errors";

export const help = {
  name: "view",
  category: "Scheduling",
  description: "Shows details for the announcement",
  usage: `${PREFIX}view {announcementID}`,
  example: `${PREFIX}view 33`,
};

export const conf = {
  enabled: true,
  guildOnly: true,
};

// no need to access core for this
export function makeViewCMD() {
  const connection = getConnection(CONNECTION_NAME);
  const announcementTORepo = connection.getRepository(AnnouncementModel);

  async function execute({ requestID, message, args }: ExecutorProps) {
    const guildID = message.guild?.id as string;
    const shortIDStr = args.firstArg;
    const shortID = parseInt(shortIDStr);
    const meta = { requestID, user: message.author.tag, guildID, shortID };

    const undef = Guard.againstNullOrUndefined(shortIDStr, "announcementID");
    const nan = Guard.againstNaN(shortID, "announcementID");
    const guard = Guard.combine([undef, nan]);

    if (!guard.succeeded) {
      logger.info(`validation: ${guard.message}`, meta);
      await message.channel.send(guard.message as string);
      return;
    }

    try {
      const announcement = await announcementTORepo.findOne({
        short_id: shortID,
        guild_id: guildID,
      });
      if (!announcement) {
        logger.info(`announcement with shortID: ${shortID} DNE`, meta);
        await message.channel.send(`no announcement found with id: \`${shortID}\``);
        return;
      }

      const normalizedAnnouncement = {
        id: announcement.short_id,
        scheduledTime: announcement.scheduled_time,
        guildID: announcement.guild_id,
        status: announcement.status,
        channelID: announcement.channel_id,
        message: announcement.message,
      };

      const embed = announcementStringEmbed(normalizedAnnouncement);
      await message.channel.send(embed);
      logger.info(`Sent ${announcement.announcement_id} to be viewed`, {
        ...meta,
        announcementID: announcement.announcement_id,
      });
    } catch (e) {
      logger.error(e, meta);
      message.channel.send(INTERNAL_ERROR_RESPONSE).catch((e) => {
        logger.error(e, meta);
      });
    }
  }

  return {
    execute,
    help,
    conf,
  };
}
