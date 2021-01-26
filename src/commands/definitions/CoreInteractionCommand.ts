import { Interaction } from "./Interaction";
import { Success } from "./Success";

export interface CoreInteractionCommand {
  help: { name: string; category: string; description: string; usage: string };
  conf: { enabled: boolean; guildOnly: boolean };
  interaction: Interaction;
  onSuccess: Success;
}
