// Message

import { v4 } from "uuid";
import { MessageEmbed } from "discord.js";

interface genMessageProps {
  id?: string;
  message?: string;
  bot?: boolean;
  guildID?: string;
  announcer?: boolean;
}

export function genTestMessage(props?: genMessageProps) {
  return {
    author: {
      id: props?.id || v4(),
      bot: !!props?.bot,
      send: async (_: string | MessageEmbed) => undefined,
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    channel: { send: async (_: string | MessageEmbed) => undefined },
    content: props?.message || "",
    guild: { id: props?.guildID || v4() },
    member: {
      roles: { cache: { some: () => (props?.announcer === undefined ? true : props.announcer) } },
    },
    react: async (_: any) => undefined,
  };
}
