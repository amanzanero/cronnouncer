import { logger } from "../infra/logger";
import { rescheduleAnnouncements } from "../core/announcement/interactions/rescheduleAnnoucements";
import { InteractionDependencies } from "../core/announcement/interactions/common";

export function makeOnReady(deps: InteractionDependencies) {
  return async function onReady() {
    const start = Date.now();
    try {
      logger.info("[onReady>>>>]");
      logger.info("cronnouncer ready to accept messages");
      await rescheduleAnnouncements(deps);
    } catch (e) {
      logger.error(e);
    }
    logger.info(`[onReady<<<<] - ${start - Date.now()}ms`);
  };
}
