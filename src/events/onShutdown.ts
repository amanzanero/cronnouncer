import { logger } from "../util";
import { Client } from "discord.js";

export interface OnShutdownProps {
  discordClient: Client;
  closeDatabase: () => Promise<void>;
}

export async function onShutdown({ discordClient, closeDatabase }: OnShutdownProps) {
  logger.info("shutting down cronnouncer...");
  discordClient.destroy();
  await closeDatabase();
  logger.info("cronnouncer shutdown");
}
