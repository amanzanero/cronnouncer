/**
 * This file contains the use case for starting a new announcement
 */

import { ScheduledTime } from "../domain/announcement";
import { Response } from "../../../lib";
import {
  AnnouncementOutput,
  AnnouncementToOutput,
  InteractionDependencies,
  interactionLogWrapper,
} from "./common";

export async function rescheduleAnnouncements(deps: InteractionDependencies) {
  return await interactionLogWrapper(deps, "rescheduleAnnouncements", async () => {
    const {
      announcementRepo,
      announcementSettingsRepo,
      cronService,
      loggerService,
      timeService,
    } = deps;
    const scheduledAnnouncements = await announcementRepo.findScheduled();
    const announcementSettings = await announcementSettingsRepo.findByGuildIDs(
      scheduledAnnouncements.map((ancmt) => ancmt.guildID),
    );

    const successfullyScheduled: string[] = [];
    const failedScheduled: string[] = [];
    const scheduledPromises = scheduledAnnouncements.reduce((acc, scheduledAncmt) => {
      const scheduledTimeUTC = timeService.scheduleTimeToUTC(
        scheduledAncmt.scheduledTime as ScheduledTime,
        announcementSettings[scheduledAncmt.guildID.value].timezone,
      );

      const scheduleAndLog = async () => {
        try {
          await cronService.scheduleAnnouncement({
            announcement: scheduledAncmt,
            scheduledTimeUTC,
            loggerService,
          });
          successfullyScheduled.push(scheduledAncmt.id.value);
        } catch (e) {
          failedScheduled.push(scheduledAncmt.id.value);
          loggerService.error("rescheduleAnnouncements", e);
        }
      };

      acc.push(scheduleAndLog());
      return acc;
    }, [] as Promise<any>[]);

    if (scheduledPromises.length === 0) {
      loggerService.info("rescheduleAnnouncements", "no announcements to reschedule");
      return Response.success<void>();
    }

    await Promise.all(scheduledPromises);

    if (successfullyScheduled.length > 0) {
      loggerService.info(
        "rescheduleAnnouncements",
        `successfully scheduled announcements: [${successfullyScheduled}]`,
      );
    }

    if (failedScheduled.length) {
      loggerService.error(
        "rescheduleAnnouncements",
        `failed to schedule announcements: [${failedScheduled}]`,
      );
    }

    return Response.success<AnnouncementOutput[]>(
      scheduledAnnouncements.map((sa) => AnnouncementToOutput(sa)),
    );
  });
}
