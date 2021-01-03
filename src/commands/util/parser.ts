import { PREFIX } from "../../constants";
import { Args } from "../definitions/Args";

export function isCommand(command: string): boolean {
  return command.startsWith(PREFIX);
}

export function parseCommand(command: string): { command: string; args: Args } {
  if (!isCommand(command) || command.length <= PREFIX.length)
    return { command: "", args: new Args("") };

  const trimmed = command.slice(PREFIX.length).trim();
  const splitPosition = trimmed.search(/\s+/g);

  let cmd, rawArgs;
  if (splitPosition >= 0) {
    cmd = trimmed.substr(0, splitPosition).trim();
    rawArgs = trimmed.substr(splitPosition).trim();
  } else {
    cmd = trimmed;
    rawArgs = "";
  }

  const args = new Args(rawArgs);

  return {
    command: cmd,
    args,
  };
}
