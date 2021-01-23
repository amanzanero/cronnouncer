export function makeMockGuild() {
  return {
    channels: {
      cache: {
        get: async (_: string) => "text-channel",
      },
    },
  };
}

export function makeMockDiscordClient() {
  return {
    guilds: {
      fetch: async (_: string) => makeMockGuild(),
    },
  };
}
