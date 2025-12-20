import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePermissionTable1766167917566 implements MigrationInterface {
  name = 'CreatePermissionTable1766167917566';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "name" character varying(255) NOT NULL, "code" character varying(100) NOT NULL, "action" character varying(50), "allowed_actions" jsonb, CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_20233134693e80f4a619663a71" ON "permissions" ("code", "action") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_20233134693e80f4a619663a71"`,
    );
    await queryRunner.query(`DROP TABLE "permissions"`);
  }
}
