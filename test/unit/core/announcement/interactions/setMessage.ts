import test from "ava";
import {
  makeSetMessage,
  InputData,
} from "../../../../../src/core/announcement/interactions/setMessage";

import { Response, InteractionExecute } from "../../../../../src/lib";
import { createMockAnnouncement } from "../../../../test_utils/mocks/mockAnnouncement";
import {
  AnnouncementError,
  AnnouncementNotInProgressError,
  ValidationError,
} from "../../../../../src/core/announcement/errors";
import {
  AnnouncementOutput,
  AnnouncementToOutput,
} from "../../../../../src/core/announcement/interactions/common";
import { MockAnnouncementRepo } from "../../../../test_utils/mocks/announcementRepo";

interface TestContext {
  repo: MockAnnouncementRepo;
  interaction: InteractionExecute<InputData, AnnouncementOutput | AnnouncementError>;
}

test.before((t) => {
  const repo = new MockAnnouncementRepo(); // using actual repo since it's in memory
  const interaction = makeSetMessage(repo);
  Object.assign(t.context, { repo, interaction });
});

test("should fail with bad input", async (t) => {
  const { interaction } = t.context as TestContext;

  const response = await interaction({
    guildID: "1",
    message: "",
  });

  const expectedErr = new ValidationError("The incoming message was not between 1 and 500");
  t.deepEqual(response.value, expectedErr);
});

test("should fail if there is no announcement in progress", async (t) => {
  const { interaction } = t.context as TestContext;

  const guildID = "1";
  const response = await interaction({
    guildID,
    message: "a valid message",
  });

  const expectedErr = new AnnouncementNotInProgressError(guildID);
  t.deepEqual(response.value, expectedErr);
});

test("should set message if announcement in progress", async (t) => {
  const { interaction, repo } = t.context as TestContext;
  const guildID = "2";

  const message = "A valid message";

  const announcement = createMockAnnouncement({
    guildID,
  });
  await repo.save(announcement);
  const response = await interaction({
    guildID,
    message,
  });

  const announcementCopy = announcement.copy();
  const expectedAnnouncement = AnnouncementToOutput(announcementCopy);
  Object.assign(expectedAnnouncement, { message });
  const expected = Response.success<AnnouncementOutput>(expectedAnnouncement);

  t.deepEqual(response, expected);
});
