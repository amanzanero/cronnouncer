import {MigrationInterface, QueryRunner} from "typeorm";

export class ModifyPublishedToStatus1610308128197 implements MigrationInterface {
    name = 'ModifyPublishedToStatus1610308128197'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "announcement" RENAME COLUMN "published" TO "status"`);
        await queryRunner.query(`ALTER TABLE "announcement" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "announcement" ADD "status" character varying(20) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "announcement" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "announcement" ADD "status" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "announcement" RENAME COLUMN "status" TO "published"`);
    }

}
