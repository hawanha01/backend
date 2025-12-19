import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1766167619465 implements MigrationInterface {
  name = 'CreateUserTable1766167619465';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "email" character varying(255) NOT NULL, "username" character varying(100) NOT NULL, "password" character varying(255) NOT NULL, "refresh_token" character varying(500), "role" character varying(50) NOT NULL DEFAULT 'store_owner', "first_name" character varying(255) NOT NULL, "last_name" character varying(255) NOT NULL, "full_name" character varying(510) NOT NULL, "phone" character varying(20) NOT NULL, "avatar" character varying(500), "is_email_verified" boolean NOT NULL DEFAULT false, "last_login_at" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON "users" ("username") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fe0bb3f6520ee0469504521e71"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
