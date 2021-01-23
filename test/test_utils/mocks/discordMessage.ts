// Message

import { v4 } from "uuid";

interface genMessageProps {
  id?: string;
  message?: string;
  bot?: boolean;
  guildID?: string;
}

export function genTestMessage(props?: genMessageProps): any {
  return {
    author: { id: props?.id || v4(), bot: !!props?.bot },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    channel: { send: async (_: string) => undefined },
    content: props?.message || "",
    guild: { id: props?.guildID || v4() },
  };
}
