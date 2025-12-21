import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductTable1766210818675 implements MigrationInterface {
  name = 'CreateProductTable1766210818675';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "description" text, "short_description" text, "price" numeric(10,2) NOT NULL, "discount_percentage" numeric(5,2) DEFAULT '0', "discounted_price" numeric(10,2), "barcode" character varying(100), "quantity" integer NOT NULL DEFAULT '0', "low_stock_threshold" integer, "is_featured" boolean NOT NULL DEFAULT false, "is_digital" boolean NOT NULL DEFAULT false, "total_sales" integer NOT NULL DEFAULT '0', "view_count" integer NOT NULL DEFAULT '0', "weight" character varying(50), "dimensions" character varying(100), "attributes" jsonb, "tags" jsonb, "images" jsonb, "meta_title" character varying(255), "meta_description" text, "store_id" uuid, CONSTRAINT "UQ_464f927ae360106b783ed0b4106" UNIQUE ("slug"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3db55e142a0d99d53e7e2ba207" ON "products" ("is_featured") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_68863607048a1abd43772b314e" ON "products" ("store_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_464f927ae360106b783ed0b410" ON "products" ("slug") `,
    );
    await queryRunner.query(`ALTER TABLE "reviews" ADD "product_id" uuid`);
    await queryRunner.query(
      `CREATE INDEX "IDX_9482e9567d8dcc2bc615981ef4" ON "reviews" ("product_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_9482e9567d8dcc2bc615981ef44" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_68863607048a1abd43772b314ef" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_68863607048a1abd43772b314ef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_9482e9567d8dcc2bc615981ef44"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9482e9567d8dcc2bc615981ef4"`,
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "product_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_464f927ae360106b783ed0b410"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_68863607048a1abd43772b314e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3db55e142a0d99d53e7e2ba207"`,
    );
    await queryRunner.query(`DROP TABLE "products"`);
  }
}
