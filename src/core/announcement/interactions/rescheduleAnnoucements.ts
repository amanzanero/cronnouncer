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

    const successfullyScheduledAnnouncements: string[] = [];
    const failedScheduledAnnouncements: string[] = [];
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
            announcementRepo,
            loggerService,
          });
          successfullyScheduledAnnouncements.push(scheduledAncmt.id.value);
        } catch (e) {
          failedScheduledAnnouncements.push(scheduledAncmt.id.value);
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

    if (successfullyScheduledAnnouncements.length > 0) {
      loggerService.info(
        "rescheduleAnnouncements",
        `successfully scheduled ${successfullyScheduledAnnouncements.length} announcements`,
        {
          successfullyScheduledAnnouncements,
        },
      );
    }

    if (failedScheduledAnnouncements.length) {
      loggerService.error(
        `failed to schedule ${failedScheduledAnnouncements.length} announcements`,
        {
          failedScheduledAnnouncements,
        },
      );
    }

    return Response.success<AnnouncementOutput[]>(
      scheduledAnnouncements.map((sa) => AnnouncementToOutput(sa)),
    );
  });
}
