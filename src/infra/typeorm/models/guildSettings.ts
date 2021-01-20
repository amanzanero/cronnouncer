import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class GuildSettings {
  @PrimaryColumn()
  guild_settings_id: string;

  @Column()
  guild_id: string;

  @Column()
  guild_name: string;

  @Column({ nullable: true })
  timezone: string;

  @Column({ default: 1 })
  next_short_id: number;

  @Column({ default: true })
  active: boolean;
}
