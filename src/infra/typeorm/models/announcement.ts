import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Announcement {
  @PrimaryColumn()
  announcement_id: string;

  @Column()
  short_id: number;

  @Column({ nullable: true })
  channel_id: string;

  @Column()
  guild_id: string;

  @Column({ nullable: true })
  message: string;

  @Column({ length: 20 })
  status: string;

  @Column({ nullable: true })
  scheduled_time: string;

  @CreateDateColumn()
  created_at: Date;
}
