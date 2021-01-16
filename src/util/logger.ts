import { createLogger, format, transports } from "winston";
import { IS_PROD } from "../constants";

const { combine, errors, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp, requestID }) => {
  const rID = !!requestID ? `[${requestID}] ` : "";
  return `${timestamp} [${level}] ${rID}${message}`;
});

const transportsList: any[] = [new transports.Console()];
if (IS_PROD) {
  // - Write to all logs with level `info` and below to `combined.log`
  // - Write all logs error (and below) to `error.log`.
  transportsList.push(
    new transports.File({ filename: `logs/${Date.now()}-error.log`, level: "error" }),
  );
  transportsList.push(new transports.File({ filename: `logs/${Date.now()}-combined.log` }));
}
export const logger = createLogger({
  format: IS_PROD
    ? combine(errors({ stack: true }), timestamp(), logFormat)
    : combine(colorize(), timestamp(), logFormat),
  transports: transportsList,
});
