import { Message } from "discord.js";
import { Response } from "../../core/lib";
import { AnnouncementOutput } from "../../core/announcement/interactions/common";

export type Success =
  | ((message: Message, response: Response<AnnouncementOutput>) => Promise<any>)
  | ((message: Message) => Promise<any>);
