import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateRoleAndPermissions1766254141004 implements MigrationInterface {
  name = 'UpdateRoleAndPermissions1766254141004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_stores" ADD "role" character varying(50) NOT NULL DEFAULT 'store_owner'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ace513fa30d485cfd25c11a9e4" ON "users" ("role") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bcb1e1cddd46d1cd0abc84d221" ON "user_stores" ("role") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bcb1e1cddd46d1cd0abc84d221"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ace513fa30d485cfd25c11a9e4"`,
    );
    await queryRunner.query(`ALTER TABLE "user_stores" DROP COLUMN "role"`);
  }
}
