import { createLogger, format, transports } from "winston";

const { combine, timestamp, label, printf, colorize } = format;

const logFormat = printf(
  ({ level, message, label, timestamp }) => `${timestamp} [${label}] ${level}: ${message}`,
);

export const logger = createLogger({
  format: combine(label({ label: "CRONNOUNCER" }), colorize(), timestamp(), logFormat),
  transports: [new transports.Console()],
});
