import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class AnnouncementSettings {
  @PrimaryColumn()
  announcement_settings_id: string;

  @Column()
  guild_id: string;

  @Column({ nullable: true })
  timezone: string;
}
