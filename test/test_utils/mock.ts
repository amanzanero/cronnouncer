// Message

interface genMessageProps {
  id?: string;
  message?: string;
  bot?: boolean;
}

export function genTestMessage(props?: genMessageProps): any {
  return {
    author: { id: props?.id || "ava", bot: !!props?.bot },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    channel: { send: async (_: string) => undefined },
    content: props?.message || "",
  };
}
