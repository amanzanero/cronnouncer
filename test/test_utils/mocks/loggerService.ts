import { ILoggerService } from "../../../src/core/announcement/services/logger";

export class MockLoggerService implements ILoggerService {
  info(_: string, __?: string, ___?: any) {
    return;
  }

  error(_: string, __: Error | string, ___?: any) {
    return;
  }
}
