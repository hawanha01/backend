import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReviewTable1766210017058 implements MigrationInterface {
  name = 'CreateReviewTable1766210017058';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "reviewer_name" character varying(255), "reviewer_email" character varying(255), "rating" integer NOT NULL, "title" text, "comment" text, "is_approved" boolean NOT NULL DEFAULT false, "is_verified_purchase" boolean NOT NULL DEFAULT false, "helpful_count" integer NOT NULL DEFAULT '0', "not_helpful_count" integer NOT NULL DEFAULT '0', "store_id" uuid, CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_09fa7773892be657dec51f0f45" ON "reviews" ("is_approved") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f4b88c05a7adf404a6e6b2f1eb" ON "reviews" ("rating") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_53d569324f429e5d3af161f165" ON "reviews" ("store_id") `,
    );
    await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "rating"`);
    await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "total_reviews"`);
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_53d569324f429e5d3af161f1657" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_53d569324f429e5d3af161f1657"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stores" ADD "total_reviews" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "stores" ADD "rating" numeric(5,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_53d569324f429e5d3af161f165"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f4b88c05a7adf404a6e6b2f1eb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_09fa7773892be657dec51f0f45"`,
    );
    await queryRunner.query(`DROP TABLE "reviews"`);
  }
}
