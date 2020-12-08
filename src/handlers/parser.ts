import { PREFIX } from "../constants";

export function parseCommand(command: string): string {
  if (!command.startsWith(PREFIX)) {
    return "";
  }
  return command.slice(PREFIX.length);
}
