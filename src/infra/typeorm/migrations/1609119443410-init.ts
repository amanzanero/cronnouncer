import {MigrationInterface, QueryRunner} from "typeorm";

export class init1609119443410 implements MigrationInterface {
    name = 'init1609119443410'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "announcement" ("announcement_id" character varying NOT NULL, "channel" character varying, "guild_id" character varying NOT NULL, "message" character varying, "published" boolean NOT NULL, "scheduled_time" character varying, CONSTRAINT "PK_017bde9e7611c5a6151ac081f6c" PRIMARY KEY ("announcement_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "announcement"`);
    }

}
