import { logger } from "../util";
import { rescheduleAnnouncements } from "../core/announcement/interactions/rescheduleAnnoucements";
import { InteractionDependencies } from "../core/announcement/interactions/common";

export async function onReady(deps: InteractionDependencies) {
  try {
    logger.info("[onStartup] scheduling pending announcements...");
    await rescheduleAnnouncements(deps);
    logger.info("[onStartup] announcements scheduled");
  } catch (e) {
    logger.error(`[onStartup] ${e.stack}`);
  }
}
