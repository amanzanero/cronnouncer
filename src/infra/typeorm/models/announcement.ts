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

  @Column()
  published: boolean;

  @Column({ nullable: true })
  scheduled_time: string;
}
