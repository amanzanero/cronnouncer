import test from "ava";
import { MockGuildSettingsRepo } from "../../../../test_utils/mocks/guildSettingsRepo";
import { setGuildTimezone } from "../../../../../src/core/announcement/interactions/setGuildTimezone";
import { ValidationError } from "../../../../../src/core/announcement/errors";
import { Timezone } from "../../../../../src/core/announcement/domain/guildSettings";
import { Response } from "../../../../../src/lib";
import { GuildSettingsOutput } from "../../../../../src/core/announcement/interactions/common";
import { createMockGuildSettings } from "../../../../test_utils/mocks/guildSettings";
import { MockLoggerService } from "../../../../test_utils/mocks/loggerService";

interface TestContext {
  deps: {
    guildSettingsRepo: MockGuildSettingsRepo;
    loggerService: MockLoggerService;
  };
}

test.before((t) => {
  const guildSettingsRepo = new MockGuildSettingsRepo();
  const loggerService = new MockLoggerService();
  Object.assign(t.context, {
    deps: {
      guildSettingsRepo,
      loggerService,
    },
  });
});

test("should return a failure for invalid input", async (t) => {
  const { deps } = t.context as TestContext;

  const timezone = "invalid timezone";
  const response = await setGuildTimezone(
    {
      guildID: "1",
      timezone,
    },
    deps as any,
  );
  const expectedResponse = Response.fail<ValidationError>(
    new ValidationError(Timezone.invalidTimezoneMessage(timezone)),
  );
  t.deepEqual(response, expectedResponse);

  const nullTimezone = undefined;
  const nullTimezoneResponse = await setGuildTimezone(
    {
      guildID: "1",
      timezone: nullTimezone,
    } as any,
    deps as any,
  );
  const expectedNullTimezoneResponse = Response.fail<ValidationError>(
    new ValidationError("No timezone was provided"),
  );
  t.deepEqual(nullTimezoneResponse, expectedNullTimezoneResponse);
});

test("should create new instance of announcement settings when not created", async (t) => {
  const { deps } = t.context as TestContext;

  const timezone = "US/Pacific";
  const response = await setGuildTimezone(
    {
      guildID: "2",
      timezone,
    },
    deps as any,
  );

  const expectedResponse = Response.success<GuildSettingsOutput>({ guildID: "2", timezone });
  t.deepEqual(response, expectedResponse);

  t.true(!!(await deps.guildSettingsRepo.findByGuildID("2")));
});

test("should update existing instance of announcement settings with timezone", async (t) => {
  const { deps } = t.context as TestContext;

  const guildID = "2";
  const timezone = "US/Pacific";
  const existingGuildSettings = createMockGuildSettings({
    guildID,
  });
  await deps.guildSettingsRepo.save(existingGuildSettings);

  const response = await setGuildTimezone(
    {
      guildID,
      timezone,
    },
    deps as any,
  );

  const expectedResponse = Response.success<GuildSettingsOutput>({ guildID: "2", timezone });

  const updatedGuildSettings = await deps.guildSettingsRepo.findByGuildID(
    existingGuildSettings.guildID,
  );

  t.deepEqual(response, expectedResponse); // get expected response
  t.is(updatedGuildSettings && updatedGuildSettings.id, existingGuildSettings.id); // make sure it's the same instance
});
