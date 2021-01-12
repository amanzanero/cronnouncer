import { logger } from "../../../util";

export interface ILoggerService {
  info(functionName: string, message: string): void;

  error(functionName: string, error: Error): void;
}

export class LoggerService implements ILoggerService {
  info(functionName: string, message: string) {
    logger.info(`[${functionName}] ${message}`);
  }

  error(functionName: string, error: Error) {
    logger.error(`[${functionName}] ${error} \n${error.stack}`);
  }
}
