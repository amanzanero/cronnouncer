import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAnnouncementSettings1610056097784 implements MigrationInterface {
    name = 'AddAnnouncementSettings1610056097784'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "announcement_settings" ("announcement_settings_id" character varying NOT NULL, "guild_id" character varying NOT NULL, "timezone" character varying, CONSTRAINT "PK_f736ad9c15e7b0386ba60c94d70" PRIMARY KEY ("announcement_settings_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "announcement_settings"`);
    }

}
