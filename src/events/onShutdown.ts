import { Client } from "discord.js";
import { logger } from "../infra/logger";

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
    logger.info("cronnouncer shutdown quietly");
    process.exit(0);
  };
}
