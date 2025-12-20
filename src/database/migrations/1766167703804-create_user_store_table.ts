import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserStoreTable1766167703804 implements MigrationInterface {
  name = 'CreateUserStoreTable1766167703804';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_stores" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "user_id" uuid, "store_id" uuid, CONSTRAINT "PK_b8f8a8e066cd32b77e78e8f7bfd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_53afbce52c22d3ba43fdbd3bef" ON "user_stores" ("user_id", "store_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_stores" ADD CONSTRAINT "FK_63e8380a29134975cd835c52549" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_stores" ADD CONSTRAINT "FK_aacfd082707f731d4d4c8805d03" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_stores" DROP CONSTRAINT "FK_aacfd082707f731d4d4c8805d03"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_stores" DROP CONSTRAINT "FK_63e8380a29134975cd835c52549"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_53afbce52c22d3ba43fdbd3bef"`,
    );
    await queryRunner.query(`DROP TABLE "user_stores"`);
  }
}
