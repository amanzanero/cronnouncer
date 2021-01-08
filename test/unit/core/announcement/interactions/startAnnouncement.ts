import test from "ava";
import { startAnnouncement } from "../../../../../src/core/announcement/interactions/startAnnouncement";
import { Response } from "../../../../../src/lib";
import { createMockAnnouncement } from "../../../../test_utils/mocks/announcement";
import {
  AnnouncementInProgressError,
  TimezoneNotSetError,
  ValidationError,
} from "../../../../../src/core/announcement/errors";
import { MockAnnouncementRepo } from "../../../../test_utils/mocks/announcementRepo";
import { AnnouncementOutput } from "../../../../../src/core/announcement/interactions/common";
import { MockAnnouncementSettingsRepo } from "../../../../test_utils/mocks/announcementSettingsRepo";
import { createMockAnnouncementSettings } from "../../../../test_utils/mocks/announcementSettings";

interface TestContext {
  deps: {
    announcementRepo: MockAnnouncementRepo;
    announcementSettingsRepo: MockAnnouncementSettingsRepo;
  };
}

test.before(async (t) => {
  const announcementRepo = new MockAnnouncementRepo();
  const announcementSettingsRepo = new MockAnnouncementSettingsRepo();
  Object.assign(t.context, {
    deps: {
      announcementRepo,
      announcementSettingsRepo,
    },
  });

  const settings = createMockAnnouncementSettings({
    timezone: "US/Pacific",
    guildID: "guild-with-timezone",
  });
  await announcementSettingsRepo.save(settings);
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

test("should not start an announcement when there is no timezone set", async (t) => {
  const { deps } = t.context as TestContext;

  const response = await startAnnouncement({ guildID: "2" }, deps as any);

  const expected = Response.fail<TimezoneNotSetError>(new TimezoneNotSetError());
  t.deepEqual(response, expected);
});

test("should successfully create", async (t) => {
  const { deps } = t.context as TestContext;

  const response = await startAnnouncement({ guildID: "guild-with-timezone" }, deps as any);

  t.deepEqual(
    Response.success<AnnouncementOutput>({ guildID: "guild-with-timezone", published: false }),
    response,
  );
});
