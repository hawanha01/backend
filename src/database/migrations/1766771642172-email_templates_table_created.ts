import { MigrationInterface, QueryRunner } from 'typeorm';

export class EmailTemplatesTableCreated1766771642172 implements MigrationInterface {
  name = 'EmailTemplatesTableCreated1766771642172';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "email_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "template_code" character varying(100) NOT NULL, "name" character varying(255) NOT NULL, "subject" character varying(500) NOT NULL, "html_content" text NOT NULL, "description" text, "variables" jsonb, CONSTRAINT "UQ_807beb95ebce914ac8ee0fee82f" UNIQUE ("template_code"), CONSTRAINT "PK_06c564c515d8cdb40b6f3bfbbb4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_807beb95ebce914ac8ee0fee82" ON "email_templates" ("template_code") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_807beb95ebce914ac8ee0fee82"`,
    );
    await queryRunner.query(`DROP TABLE "email_templates"`);
  }
}
