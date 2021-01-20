import {MigrationInterface, QueryRunner} from "typeorm";

export class init1611116801164 implements MigrationInterface {
    name = 'init1611116801164'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "announcement" RENAME COLUMN "channel" TO "channel_id"`);
        await queryRunner.query(`CREATE TABLE "guild_settings" ("guild_settings_id" character varying NOT NULL, "guild_id" character varying NOT NULL, "guild_name" character varying NOT NULL, "timezone" character varying, "next_short_id" integer NOT NULL DEFAULT '1', "active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_abd92819738196e58f43e3d59cd" PRIMARY KEY ("guild_settings_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "guild_settings"`);
        await queryRunner.query(`ALTER TABLE "announcement" RENAME COLUMN "channel_id" TO "channel"`);
    }

}
