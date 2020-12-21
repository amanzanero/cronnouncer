import { createStartAnnouncementUseCase } from "./useCase";
import { announcementRepo } from "../../repos";

export const startAnnouncementUseCase = createStartAnnouncementUseCase(announcementRepo);
