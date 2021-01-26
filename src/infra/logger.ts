import { createLogger, format, transports } from "winston";
import { LoggingWinston } from "@google-cloud/logging-winston";
import { GCLOUD_PROJECT_ID, SERVICE_KEYFILE } from "../constants";

const { combine, errors, timestamp, json } = format;

const transportsList: any[] = [new transports.Console()];

if (GCLOUD_PROJECT_ID) {
  const loggingWinston = new LoggingWinston({
    projectId: GCLOUD_PROJECT_ID,
    keyFilename: SERVICE_KEYFILE,
    logName: "cronnouncer-prod",
  });
  transportsList.push(loggingWinston);
}

export const logger = createLogger({
  format: combine(errors({ stack: true }), timestamp(), json()),
  transports: transportsList,
});
