import { v4 } from "uuid";
import { UniqueEntityID } from "../../../src/lib";
import { GuildSettings, Timezone } from "../../../src/core/announcement/domain/guildSettings";

interface OptionalMockGuildSettingsProps {
  id?: string;
  guildID?: string;
  timezone?: string;
  nextShortID?: number;
}

export function createMockGuildSettings(props: OptionalMockGuildSettingsProps): GuildSettings {
  const timezone = Timezone.create(props.timezone ? props.timezone : "US/Pacific").getValue();

  return GuildSettings.create(
    {
      guildID: props.guildID || v4(),
      nextShortID: props.nextShortID || 1,
      timezone,
    },
    new UniqueEntityID(props.id || v4()),
  ).getValue();
}
