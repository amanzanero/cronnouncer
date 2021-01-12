import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class Announcement {
  @PrimaryColumn()
  announcement_id: string;

  @Column({ nullable: true })
  channel: string;

  @Column()
  guild_id: string;

  @Column({ nullable: true })
  message: string;

  @Column({ length: 20 })
  status: string;

  @Column({ nullable: true })
  scheduled_time: string;
}
