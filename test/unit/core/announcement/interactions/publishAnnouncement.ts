import test from "ava";
import moment from "moment";
import { Response } from "../../../../../src/lib";
import { createMockAnnouncement } from "../../../../test_utils/mocks/mockAnnouncement";
import {
  AnnouncementIncompleteError,
  AnnouncementNotInProgressError,
  ValidationError,
} from "../../../../../src/core/announcement/errors";
import {
  AnnouncementOutput,
  AnnouncementToOutput,
} from "../../../../../src/core/announcement/interactions/common";
import { MockAnnouncementRepo } from "../../../../test_utils/mocks/announcementRepo";
import { publishAnnouncement } from "../../../../../src/core/announcement/interactions/publishAnnouncement";

interface TestContext {
  deps: {
    announcementRepo: MockAnnouncementRepo;
  };
}

test.before((t) => {
  const announcementRepo = new MockAnnouncementRepo(); // using actual announcementRepo since it's in memory
  Object.assign(t.context, {
    deps: {
      announcementRepo,
    },
  });
});

test("should fail with undefined input", async (t) => {
  const { deps } = t.context as TestContext;

  const input: any = { guildID: undefined };
  const response = await publishAnnouncement(input, deps as any);

  const expectedErr = new ValidationError("guildID is null or undefined");
  t.deepEqual(response.value, expectedErr);
});

test("should fail if there is no announcement in progress", async (t) => {
  const { deps } = t.context as TestContext;

  const guildID = "1";
  const input: any = { guildID };
  const response = await publishAnnouncement(input, deps as any);

  const expectedErr = new AnnouncementNotInProgressError(guildID);
  t.deepEqual(response.value, expectedErr);
});

test("should fail if announcement in progress is not complete", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo } = deps;

  const guildID = "1";

  const announcement = createMockAnnouncement({ guildID });
  await announcementRepo.save(announcement);

  const input: any = { guildID };
  const response = await publishAnnouncement(input, deps as any);

  const expectedErr = new AnnouncementIncompleteError();
  t.deepEqual(response.value, expectedErr);
});

test("should pass if announcement in progress is completed", async (t) => {
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
  const response = await publishAnnouncement(input, deps as any);

  const expected = Response.success<AnnouncementOutput>(AnnouncementToOutput(announcement));
  t.deepEqual(response, expected);
});
