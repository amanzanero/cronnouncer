import { main } from "./bot";
import { logger } from "./infra/logger";

main().catch((e) => {
  logger.error(e);
  process.exit(-1);
});
