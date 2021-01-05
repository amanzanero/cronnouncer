import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp, requestID }) => {
  const text = (message as any) instanceof Error ? ((message as unknown) as Error).stack : message;
  const rID = !!requestID ? `[${requestID}] ` : "";
  return `${timestamp} [${level}] ${rID}${text}`;
});
export const logger = createLogger({
  format: combine(colorize(), timestamp(), logFormat),
  transports: [new transports.Console()],
});
