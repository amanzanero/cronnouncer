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

    acc.push(cronService.scheduleAnnouncement(scheduledAncmt, scheduledTimeUTC));
    return acc;
  }, [] as Promise<any>[]);

  await Promise.all(scheduledPromises);
  return Response.success<AnnouncementOutput[]>(
    scheduledAnnouncements.map((sa) => AnnouncementToOutput(sa)),
  );
}
