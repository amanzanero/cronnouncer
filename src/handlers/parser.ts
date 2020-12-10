import { PREFIX } from "../constants";

export function isCommand(command: string): boolean {
  return command.startsWith(PREFIX);
}

export function parseCommand(command: string): string {
  if (!command.startsWith(PREFIX)) {
    return "";
  }
  return command.slice(PREFIX.length);
}
