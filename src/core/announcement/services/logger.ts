import { logger } from "../../../util";

export interface ILoggerService {
  info(functionName: string, message: string, meta?: any): void;

  error(functionName: string, error: Error, meta?: any): void;
}

export class LoggerService implements ILoggerService {
  info(functionName: string, message: string, meta?: any) {
    logger.info(`[${functionName}] ${message}`, meta);
  }

  error(functionName: string, error: Error, meta?: any) {
    logger.error(`[${functionName}] ${error} \n${error.stack}`, meta);
  }
}
