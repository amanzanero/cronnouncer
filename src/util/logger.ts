import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`);

export const logger = createLogger({
  format: combine(colorize(), timestamp(), logFormat),
  transports: [new transports.Console()],
});
