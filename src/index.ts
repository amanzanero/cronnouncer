import { main } from "./bot";
import { logger } from "./util";

main().catch((e) => {
  logger.error(e);
  process.exit(1);
});
