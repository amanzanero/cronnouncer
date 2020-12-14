import { main } from "./bot";
import { logger } from "./services";

main().catch((e) => {
  logger.error(e.stack);
  process.exit(1);
});
