import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTenantNameColumn1761151000000 implements MigrationInterface {
    name = 'FixTenantNameColumn1761151000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the lowercase 'name' column and 'schema' column as they are duplicates
        await queryRunner.query(`ALTER TABLE "tenants" DROP CONSTRAINT IF EXISTS "UQ_32731f181236a46182a38c992a8"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN IF EXISTS "name"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN IF EXISTS "schema"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Re-add the columns if needed to rollback
        await queryRunner.query(`ALTER TABLE "tenants" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD CONSTRAINT "UQ_32731f181236a46182a38c992a8" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD "schema" character varying NOT NULL`);
    }
}
