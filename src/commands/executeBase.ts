import { Message } from "discord.js";
import { AnnouncementError } from "../core/announcement/errors";
import { getActionFromError } from "./config/errors";
import { logger } from "../services";
import { Response } from "../lib";
import { AnnouncementOutput } from "../core/announcement/interactions/common";
import { Args } from "./config/Args";

type InteractionResponse = Promise<Response<AnnouncementOutput | AnnouncementError | void>>;
type InteractionFunc =
  | ((message: Message, args: Args) => InteractionResponse)
  | ((message: Message) => InteractionResponse);

interface ExecuteBaseProps {
  interaction: InteractionFunc;
  onSuccess:
    | ((message: Message, response: Response<AnnouncementOutput>) => Promise<any>)
    | ((message: Message) => Promise<any>);
  message: Message;
  args: Args;
}

export async function executeBase(props: ExecuteBaseProps) {
  const { interaction, onSuccess, message, args } = props;
  try {
    const response = await interaction(message, args);

    if (response.failed) {
      const responseError = response.value as AnnouncementError;
      const action = getActionFromError({ message, responseError });
      await action();
      return;
    }

    await onSuccess(message, response as Response<AnnouncementOutput>);
  } catch (e) {
    logger.error(e.stack);
  }
}
