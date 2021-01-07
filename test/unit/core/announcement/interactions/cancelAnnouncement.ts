import test from "ava";
import moment from "moment";
import { cancelAnnouncement } from "../../../../../src/core/announcement/interactions/cancelAnnouncement";
import { Response } from "../../../../../src/lib";
import { createMockAnnouncement } from "../../../../test_utils/mocks/announcement";
import {
  AnnouncementNotInProgressError,
  ValidationError,
} from "../../../../../src/core/announcement/errors";
import { MockAnnouncementRepo } from "../../../../test_utils/mocks/announcementRepo";

interface TestContext {
  deps: {
    announcementRepo: MockAnnouncementRepo;
  };
}

test.before((t) => {
  const announcementRepo = new MockAnnouncementRepo();
  Object.assign(t.context, { deps: { announcementRepo } });
});

test("should not delete with undefined inputs", async (t) => {
  const { deps } = t.context as TestContext;

  const input: any = { guildID: undefined };
  const response = await cancelAnnouncement(input, deps as any);

  const expectedErr = new ValidationError("guildID is null or undefined");
  t.deepEqual(response.value, expectedErr);
});

test("should not delete if no announcement in progress", async (t) => {
  const { deps } = t.context as TestContext;

  const guildID = "1";
  const input: any = { guildID };
  const response = await cancelAnnouncement(input, deps as any);

  const expectedErr = new AnnouncementNotInProgressError(guildID);
  t.deepEqual(response.value, expectedErr);
});

test("should delete", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo } = deps;

  const guildID = "2";

  const announcement = createMockAnnouncement({
    channel: "some-channel",
    guildID,
    message: "A message!",
    scheduledTime: moment().add(1, "day"),
  });
  await announcementRepo.save(announcement);

  const input: any = { guildID };
  const response = await cancelAnnouncement(input, deps as any);

  const expected = Response.success<void>();
  const deleted = await announcementRepo.findWorkInProgressByGuildID(announcement.guildID);
  t.deepEqual(response, expected);
  t.is(deleted, undefined);
});
