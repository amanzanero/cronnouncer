import { logger } from "../../../util";

export interface ILoggerService {
  error(error: Error | string, meta?: any): void;

  info(functionName: string, message?: string, meta?: any): void;
}

export class LoggerService implements ILoggerService {
  error(error: Error | string, meta?: any) {
    logger.error(error as string, meta);
  }

  info(functionName: string, message?: string, meta?: any) {
    logger.info(`[${functionName}]${message ? ` ${message}` : ""}`, meta);
  }
}
