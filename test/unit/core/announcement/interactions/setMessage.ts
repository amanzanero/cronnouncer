import test from "ava";
import { setMessage } from "../../../../../src/core/announcement/interactions/setMessage";
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

  const input: any = { guildID: "1", message: "" };
  const response = await setMessage(input, deps as any);

  const expectedErr = new ValidationError("The incoming message was not between 1 and 500");
  t.deepEqual(response.value, expectedErr);
});

test("should fail if there is no announcement in progress", async (t) => {
  const { deps } = t.context as TestContext;

  const guildID = "1";
  const input = { guildID, message: "valid" };
  const response = await setMessage(input, deps as any);

  const expectedErr = new AnnouncementNotInProgressError(guildID);
  t.deepEqual(response.value, expectedErr);
});

test("should set message if announcement in progress", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo } = deps;

  const guildID = "2";
  const message = "A valid message";

  const announcement = createMockAnnouncement({
    guildID,
  });
  await announcementRepo.save(announcement);

  const input = { guildID, message };
  const response = await setMessage(input, deps as any);

  const announcementCopy = announcement.copy();
  const expectedAnnouncement = AnnouncementToOutput(announcementCopy);
  Object.assign(expectedAnnouncement, { message });
  const expected = Response.success<AnnouncementOutput>(expectedAnnouncement);

  t.deepEqual(response, expected);
});
