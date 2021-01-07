import { v4 } from "uuid";
import { GuildID } from "../../../src/core/announcement/domain/announcement";
import { UniqueEntityID } from "../../../src/lib";
import {
  AnnouncementSettings,
  Timezone,
} from "../../../src/core/announcement/domain/announcementSettings";

interface OptionalMockAnnouncementSettingsProps {
  id?: string;
  guildID?: string;
  timezone?: string;
}

export function createMockAnnouncementSettings(
  props: OptionalMockAnnouncementSettingsProps,
): AnnouncementSettings {
  const guildID = GuildID.create(props.guildID || v4()).getValue();
  const timezone = props.timezone ? Timezone.create(props.timezone).getValue() : undefined;

  return AnnouncementSettings.create(
    {
      guildID,
      timezone,
    },
    new UniqueEntityID(props.id || v4()),
  ).getValue();
}
