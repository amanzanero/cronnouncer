import { createLogger, format, transports } from "winston";
import { LoggingWinston } from "@google-cloud/logging-winston";
import path from "path";
import { GCLOUD_PROJECT_ID } from "../constants";

const { combine, errors, timestamp, json } = format;

const transportsList: any[] = [new transports.Console()];

if (GCLOUD_PROJECT_ID) {
  const loggingWinston = new LoggingWinston({
    projectId: GCLOUD_PROJECT_ID,
    keyFilename: path.resolve(__dirname, "../../service-key.json"),
    logName: "cronnouncer-prod",
  });
  transportsList.push(loggingWinston);
}

export const logger = createLogger({
  format: combine(errors({ stack: true }), timestamp(), json()),
  transports: transportsList,
});
