import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderItemTable1766211550161 implements MigrationInterface {
  name = 'CreateOrderItemTable1766211550161';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "order_number" character varying(100) NOT NULL, "buyer_name" character varying(255) NOT NULL, "buyer_email" character varying(255) NOT NULL, "buyer_phone_number" character varying(20) NOT NULL, "billing_address" character varying(255) NOT NULL, "billing_address_line2" character varying(255), "billing_city" character varying(100) NOT NULL, "billing_state" character varying(100) NOT NULL, "billing_zip_code" character varying(20) NOT NULL, "billing_country" character varying(100) NOT NULL, "shipping_address" character varying(255) NOT NULL, "shipping_address_line2" character varying(255), "shipping_city" character varying(100) NOT NULL, "shipping_state" character varying(100) NOT NULL, "shipping_zip_code" character varying(20) NOT NULL, "shipping_country" character varying(100) NOT NULL, "subtotal" numeric(10,2) NOT NULL, "tax_amount" numeric(10,2) NOT NULL DEFAULT '0', "shipping_cost" numeric(10,2) NOT NULL DEFAULT '0', "discount_amount" numeric(10,2) NOT NULL DEFAULT '0', "total_amount" numeric(10,2) NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'pending', "payment_method" character varying(50), "payment_status" character varying(50), "transaction_id" character varying(255), "tracking_number" character varying(255), "shipping_carrier" character varying(100), "shipped_at" TIMESTAMP, "delivered_at" TIMESTAMP, "notes" text, "internal_notes" text, CONSTRAINT "UQ_75eba1c6b1a66b09f2a97e6927b" UNIQUE ("order_number"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_775c9f06fc27ae3ff8fb26f2c4" ON "orders" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1afe31fc27838ad670e3a280cf" ON "orders" ("buyer_phone_number") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_abbd6441ce2aecb38da2f80b46" ON "orders" ("buyer_email") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_75eba1c6b1a66b09f2a97e6927" ON "orders" ("order_number") `,
    );
    await queryRunner.query(
      `CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "product_name" character varying(255) NOT NULL, "product_sku" character varying(100), "unit_price" numeric(10,2) NOT NULL, "discounted_price" numeric(10,2), "quantity" integer NOT NULL, "subtotal" numeric(10,2) NOT NULL, "tax_amount" numeric(10,2) NOT NULL DEFAULT '0', "total" numeric(10,2) NOT NULL, "order_id" uuid, "product_id" uuid, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_6335813ef19bc35b8d866cc656" ON "order_items" ("order_id", "product_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_9263386c35b6b242540f9493b00" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_9263386c35b6b242540f9493b00"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_145532db85752b29c57d2b7b1f1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6335813ef19bc35b8d866cc656"`,
    );
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_75eba1c6b1a66b09f2a97e6927"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_abbd6441ce2aecb38da2f80b46"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1afe31fc27838ad670e3a280cf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_775c9f06fc27ae3ff8fb26f2c4"`,
    );
    await queryRunner.query(`DROP TABLE "orders"`);
  }
}
