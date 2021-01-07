import test from "ava";
import { startAnnouncement } from "../../../../../src/core/announcement/interactions/startAnnouncement";
import { Response } from "../../../../../src/lib";
import { createMockAnnouncement } from "../../../../test_utils/mocks/announcement";
import {
  AnnouncementInProgressError,
  ValidationError,
} from "../../../../../src/core/announcement/errors";
import { MockAnnouncementRepo } from "../../../../test_utils/mocks/announcementRepo";
import { AnnouncementOutput } from "../../../../../src/core/announcement/interactions/common";

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

test("should fail with undefined DTO field", async (t) => {
  const { deps } = t.context as TestContext;

  const response = await startAnnouncement({} as any, deps as any);

  const expectedErr = new ValidationError("guildID is null or undefined");
  t.deepEqual(response.value, expectedErr);
});

test("should fail when an announcement is in progress for a guild", async (t) => {
  const { deps } = t.context as TestContext;
  const { announcementRepo } = deps;

  const existingAnnouncement = createMockAnnouncement({
    guildID: "1",
  });
  await announcementRepo.save(existingAnnouncement);

  const response = await startAnnouncement({ guildID: "1" }, deps as any);

  const expected = new AnnouncementInProgressError(existingAnnouncement.guildID.value);
  t.deepEqual(response.value, expected);
});

test("should successfully create", async (t) => {
  const { deps } = t.context as TestContext;

  const response = await startAnnouncement({ guildID: "2" }, deps as any);

  t.deepEqual(
    Response.success<AnnouncementOutput>({ guildID: "2", published: false }),
    response,
  );
});
