import { PREFIX } from "../constants";

export function isCommand(command: string): boolean {
  return command.startsWith(PREFIX);
}

export function parseCommand(command: string): { command: string; args: string[] } {
  if (!isCommand(command) || command.length <= PREFIX.length) return { command: "", args: [] };

  const trimmed = command.slice(PREFIX.length).trim();
  const split = trimmed.split(/ +/g);
  const cmd = (split.shift() as string).toLowerCase();
  return {
    command: cmd,
    args: split,
  };
}
