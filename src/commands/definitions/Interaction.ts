import { Message } from "discord.js";
import {
  AnnouncementOutput,
  GuildSettingsOutput,
  InteractionDependencies,
} from "../../core/announcement/interactions/common";
import { Response } from "../../lib";
import { ValidationError } from "../../core/announcement/errors";
import { Args } from "./Args";

export type Interaction =
  | ((
      props: InteractionDependencies,
      message: Message,
    ) => Promise<Response<ValidationError | void | AnnouncementOutput | GuildSettingsOutput>>)
  | ((
      props: InteractionDependencies,
      message: Message,
      args: Args,
    ) => Promise<Response<ValidationError | void | AnnouncementOutput | GuildSettingsOutput>>);
