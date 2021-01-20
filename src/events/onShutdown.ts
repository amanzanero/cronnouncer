import { logger } from "../infra/logger";
import { Client } from "discord.js";

export interface OnShutdownProps {
  discordClient: Client;
  storesDisconnect: () => Promise<void>;
}

export function makeOnShutdown({ discordClient, storesDisconnect }: OnShutdownProps) {
  return async function onShutdown() {
    logger.info("shutting down cronnouncer...");
    try {
      discordClient.destroy();
      await storesDisconnect();
    } catch (e) {
      logger.error(e);
      process.exit(-1);
    }
    process.exit(0);
  };
}
