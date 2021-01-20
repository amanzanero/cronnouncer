import test, { before } from "ava";
import { createAnnouncement } from "../../../../../src/core/announcement/interactions/createAnnouncement";
import { Response } from "../../../../../src/core/lib";
import { TimezoneNotSetError, ValidationError } from "../../../../../src/core/announcement/errors";
import { MockAnnouncementRepo } from "../../../../test_utils/mocks/announcementRepo";
import { AnnouncementOutput } from "../../../../../src/core/announcement/interactions/common";
import { MockGuildSettingsRepo } from "../../../../test_utils/mocks/guildSettingsRepo";
import { createMockGuildSettings } from "../../../../test_utils/mocks/guildSettings";
import { AnnouncementStatus } from "../../../../../src/core/announcement/domain/announcement/Status";
import { MockLoggerService } from "../../../../test_utils/mocks/loggerService";
import { MockIdentifierService } from "../../../../test_utils/mocks/identifierService";

interface TestContext {
  deps: {
    announcementRepo: MockAnnouncementRepo;
    guildSettingsRepo: MockGuildSettingsRepo;
    loggerService: MockLoggerService;
    identifierService: MockIdentifierService;
  };
}

before(async (t) => {
  const announcementRepo = new MockAnnouncementRepo();
  const guildSettingsRepo = new MockGuildSettingsRepo();
  const loggerService = new MockLoggerService();
  const identifierService = new MockIdentifierService(announcementRepo);
  Object.assign(t.context, {
    deps: {
      announcementRepo,
      guildSettingsRepo,
      loggerService,
      identifierService,
    },
  });

  const settings = createMockGuildSettings({
    timezone: "US/Pacific",
    guildID: "guild-with-timezone",
  });
  await guildSettingsRepo.save(settings);
});

test("should fail with undefined guildID", async (t) => {
  const { deps } = t.context as TestContext;
  const input: any = { guildID: undefined };
  const response = await createAnnouncement(input, deps as any);

  const expectedErr = Response.fail<ValidationError>(
    new ValidationError("No guildID was provided"),
  );
  t.deepEqual(response, expectedErr);
});

test("should not start an announcement when there is no timezone set", async (t) => {
  const { deps } = t.context as TestContext;

  const response = await createAnnouncement({ guildID: "no-timezone" }, deps as any);

  const expected = Response.fail<TimezoneNotSetError>(new TimezoneNotSetError());
  t.deepEqual(response, expected);
  Object.entries(deps.announcementRepo.datastore).forEach((kv) => {
    t.true(kv[1]?.guildID !== "no-timezone");
  });
});

test("should successfully create", async (t) => {
  const { deps } = t.context as TestContext;

  const response = await createAnnouncement({ guildID: "guild-with-timezone" }, deps as any);

  const id = (response.value as AnnouncementOutput).id;
  t.deepEqual(
    Response.success<AnnouncementOutput>({
      id,
      guildID: "guild-with-timezone",
      status: AnnouncementStatus.unscheduled,
    }),
    response,
  );

  const shouldBeTrue = Object.entries(deps.announcementRepo.datastore).reduce((acc, kv) => {
    return acc || kv[1]?.guildID === "guild-with-timezone";
  }, false);
  t.true(shouldBeTrue);
});
