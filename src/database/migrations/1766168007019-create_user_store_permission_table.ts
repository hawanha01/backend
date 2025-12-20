import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserStorePermissionTable1766168007019 implements MigrationInterface {
  name = 'CreateUserStorePermissionTable1766168007019';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_store_permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "user_store_id" uuid, "permission_id" uuid, CONSTRAINT "PK_10d7c9726081a69c12ec25a8196" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_04595ca713ad26b30918f3f48f" ON "user_store_permissions" ("user_store_id", "permission_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_store_permissions" ADD CONSTRAINT "FK_857803a4ca6e9a591b962966141" FOREIGN KEY ("user_store_id") REFERENCES "user_stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_store_permissions" ADD CONSTRAINT "FK_a36085487ce15e3fb83af70aa66" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_store_permissions" DROP CONSTRAINT "FK_a36085487ce15e3fb83af70aa66"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_store_permissions" DROP CONSTRAINT "FK_857803a4ca6e9a591b962966141"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_04595ca713ad26b30918f3f48f"`,
    );
    await queryRunner.query(`DROP TABLE "user_store_permissions"`);
  }
}
