// Message

export function genTestMessage(message?: string): any {
  return {
    author: { id: "ava" },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    channel: { send: async (_: string) => undefined },
    content: message || "",
  };
}
