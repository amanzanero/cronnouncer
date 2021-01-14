import { logger } from "../../../util";

export interface ILoggerService {
  info(functionName: string, message?: string, meta?: any): void;

  error(functionName: string, error: Error | string, meta?: any): void;
}

export class LoggerService implements ILoggerService {
  info(functionName: string, message?: string, meta?: any) {
    logger.info(`[${functionName}]${message ? ` ${message}` : ""}`, meta);
  }

  error(functionName: string, error: Error | string, meta?: any) {
    logger.error(
      error instanceof Error
        ? `[${functionName}] ${error} \n${error.stack}`
        : `[${functionName}] ${error}`,
      meta,
    );
  }
}
