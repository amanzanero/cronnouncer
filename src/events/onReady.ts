import { logger } from "../util";
import { rescheduleAnnouncements } from "../core/announcement/interactions/rescheduleAnnoucements";
import { InteractionDependencies } from "../core/announcement/interactions/common";

export async function onReady(deps: InteractionDependencies) {
  try {
    logger.info("[onReady>>>>]");
    const start = Date.now();
    await rescheduleAnnouncements(deps);
    logger.info(`[onReady<<<<] - ${start - Date.now()}ms`);
  } catch (e) {
    logger.error(e);
  }
}
