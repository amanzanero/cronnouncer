import test from "ava";
import moment from "moment";
import { setTime } from "../../../../../src/core/announcement/interactions/setTime";
import { Response } from "../../../../../src/lib";
import { createMockAnnouncement } from "../../../../test_utils/mocks/mockAnnouncement";
import {
  AnnouncementNotInProgressError,
  ValidationError,
} from "../../../../../src/core/announcement/errors";
import {
  AnnouncementOutput,
  AnnouncementToOutput,
} from "../../../../../src/core/announcement/interactions/common";
import { MockAnnouncementRepo } from "../../../../test_utils/mocks/announcementRepo";
import { DATE_FORMAT } from "../../../../../src/core/announcement/domain/announcement";

interface TestContext {
  deps: {
    announcementRepo: MockAnnouncementRepo;
  };
}

test.before((t) => {
  const announcementRepo = new MockAnnouncementRepo(); // using actual repo since it's in memory
  Object.assign(t.context, {
    deps: {
      announcementRepo,
    },
  });
});

test("should fail with bad input", async (t) => {
  const { deps } = t.context as TestContext;

  const input = { guildID: "1", scheduledTime: moment().format(DATE_FORMAT) };
  const response = await setTime(input, deps as any);

  const expectedErr = new ValidationError("Scheduled time must be at least a minute away.");
  t.deepEqual(response.value, expectedErr);
});

test("should fail if there is no announcement in progress", async (t) => {
  const { deps } = t.context as TestContext;

  const guildID = "1";
  const input = {
    guildID,
    scheduledTime: moment().add(1, "day").format(DATE_FORMAT),
  };
  const response = await setTime(input, deps as any);

  const expectedErr = new AnnouncementNotInProgressError(guildID);
  t.deepEqual(response.value, expectedErr);
});

test("should set time if announcement in progress", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo } = deps;

  const guildID = "2";
  const mScheduledTime = moment().add(2, "minutes");

  const announcement = createMockAnnouncement({
    guildID,
    scheduledTime: mScheduledTime,
  });
  await announcementRepo.save(announcement);

  const input = { guildID, scheduledTime: mScheduledTime.format(DATE_FORMAT) };
  const response = await setTime(input, deps as any);

  const expected = Response.success<AnnouncementOutput>(AnnouncementToOutput(announcement));
  t.deepEqual(response, expected);
});
