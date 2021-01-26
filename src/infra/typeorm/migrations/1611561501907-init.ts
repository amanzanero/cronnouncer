import {MigrationInterface, QueryRunner} from "typeorm";

export class init1611561501907 implements MigrationInterface {
    name = 'init1611561501907'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "announcement" ("announcement_id" character varying NOT NULL, "short_id" integer NOT NULL, "channel_id" character varying, "guild_id" character varying NOT NULL, "user_id" character varying NOT NULL, "message" character varying, "status" character varying(20) NOT NULL, "scheduled_time" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_017bde9e7611c5a6151ac081f6c" PRIMARY KEY ("announcement_id"))`);
        await queryRunner.query(`CREATE TABLE "guild_settings" ("guild_settings_id" character varying NOT NULL, "guild_id" character varying NOT NULL, "timezone" character varying, "next_short_id" integer NOT NULL DEFAULT '1', "active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_abd92819738196e58f43e3d59cd" PRIMARY KEY ("guild_settings_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "guild_settings"`);
        await queryRunner.query(`DROP TABLE "announcement"`);
    }

}
