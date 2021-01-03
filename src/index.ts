import { main } from "./bot";
import { logger } from "./util";

main().catch((e) => {
  logger.error(e.stack);
  process.exit(1);
});
