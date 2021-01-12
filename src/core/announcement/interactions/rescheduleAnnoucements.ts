/**
 * This file contains the use case for starting a new announcement
 */

import { ScheduledTime } from "../domain/announcement";
import { Response } from "../../../lib";
import { AnnouncementOutput, AnnouncementToOutput, InteractionDependencies } from "./common";

export async function rescheduleAnnouncements({
  announcementRepo,
  announcementSettingsRepo,
  cronService,
  loggerService,
  timeService,
}: InteractionDependencies) {
  const scheduledAnnouncements = await announcementRepo.findScheduled();
  const announcementSettings = await announcementSettingsRepo.findByGuildIDs(
    scheduledAnnouncements.map((ancmt) => ancmt.guildID),
  );

  const scheduledPromises = scheduledAnnouncements.reduce((acc, scheduledAncmt) => {
    const scheduledTimeUTC = timeService.scheduleTimeToUTC(
      scheduledAncmt.scheduledTime as ScheduledTime,
      announcementSettings[scheduledAncmt.guildID.value].timezone,
    );

    const scheduleAndLog = async () => {
      try {
        await cronService.scheduleAnnouncement(scheduledAncmt, scheduledTimeUTC);
        loggerService.info(
          "rescheduleAnnouncements",
          `rescheduled announcement: ${scheduledAncmt.id.value}`,
        );
      } catch (e) {
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
  return Response.success<AnnouncementOutput[]>(
    scheduledAnnouncements.map((sa) => AnnouncementToOutput(sa)),
  );
}
