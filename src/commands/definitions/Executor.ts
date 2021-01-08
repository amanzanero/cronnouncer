import Discord from "discord.js";
import { Args } from "./Args";

interface ExecutorProps {
  requestID: string;
  message: Discord.Message;
  args: Args;
}

export type Executor = (props: ExecutorProps) => Promise<void>;
