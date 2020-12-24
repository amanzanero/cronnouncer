import test from "ava";
import moment from "moment";
import { makeSetTime, InputData } from "../../../../../src/core/announcement/interactions/setTime";
import {
  AnnouncementRepo,
  IAnnouncementRepo,
} from "../../../../../src/core/announcement/repos/AnnouncementRepo";
import { Response, InteractionExecute } from "../../../../../src/lib";
import { createMockAnnouncement } from "../../mocks/mockAnnouncement";
import {
  AnnouncementError,
  AnnouncementNotInProgressError,
  ValidationError,
} from "../../../../../src/core/announcement/errors";
import { DATE_FORMAT } from "../../../../../src/core/announcement/domain";
import {
  AnnouncementOutput,
  AnnouncementToOutput,
} from "../../../../../src/core/announcement/interactions/common";

interface TestContext {
  repo: IAnnouncementRepo;
  interaction: InteractionExecute<InputData, AnnouncementOutput | AnnouncementError>;
}

test.before((t) => {
  const repo = new AnnouncementRepo(); // using actual repo since it's in memory
  const interaction = makeSetTime(repo);
  Object.assign(t.context, { repo, interaction });
});

test("should fail with bad input", async (t) => {
  const { interaction } = t.context as TestContext;

  const scheduledTime = moment().toISOString();
  const response = await interaction({
    guildID: "1",
    scheduledTime,
  });

  const expectedErr = new ValidationError(
    `The date '${scheduledTime}' was not in the correct format`,
  );
  t.deepEqual(response.value, expectedErr);
});

test("should fail if there is no announcement in progress", async (t) => {
  const { interaction } = t.context as TestContext;

  const guildID = "1";
  const response = await interaction({
    guildID,
    scheduledTime: moment().format(DATE_FORMAT),
  });

  const expectedErr = new AnnouncementNotInProgressError(guildID);
  t.deepEqual(response.value, expectedErr);
});

test("should set time if announcement in progress", async (t) => {
  const { interaction, repo } = t.context as TestContext;
  const guildID = "2";

  const mScheduledTime = moment();
  const scheduledTime = mScheduledTime.format(DATE_FORMAT);

  const announcement = createMockAnnouncement({
    guildID,
    scheduledTime: mScheduledTime,
  });
  await repo.save(announcement);
  const response = await interaction({
    guildID,
    scheduledTime,
  });

  const expected = Response.success<AnnouncementOutput>(AnnouncementToOutput(announcement));
  t.deepEqual(response, expected);
});
