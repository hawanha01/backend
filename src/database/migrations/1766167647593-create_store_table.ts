import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStoreTable1766167647593 implements MigrationInterface {
  name = 'CreateStoreTable1766167647593';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "stores" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "description" text, "logo" character varying(500), "banner" character varying(500), "address" character varying(255) NOT NULL, "city" character varying(100) NOT NULL, "state" character varying(100) NOT NULL, "zip_code" character varying(20), "country" character varying(100) NOT NULL, "phone_number" character varying(20) NOT NULL, "email" character varying(255) NOT NULL, "website" character varying(500) NOT NULL, "rating" numeric(5,2) NOT NULL DEFAULT '0', "total_reviews" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_790b2968701a6ff5ff383237765" UNIQUE ("slug"), CONSTRAINT "PK_7aa6e7d71fa7acdd7ca43d7c9cb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_c13fc01184985d8a9d70a7cba0" ON "stores" ("website") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d562055db7e3426d4d34e48d8e" ON "stores" ("phone_number") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_4a946bd8ef9834431ade78d639" ON "stores" ("email") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_790b2968701a6ff5ff38323776" ON "stores" ("slug") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_790b2968701a6ff5ff38323776"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4a946bd8ef9834431ade78d639"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d562055db7e3426d4d34e48d8e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c13fc01184985d8a9d70a7cba0"`,
    );
    await queryRunner.query(`DROP TABLE "stores"`);
  }
}
