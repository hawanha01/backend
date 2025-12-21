import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { BaseEntity } from '../../../database/entity/base.entity';
import { Order } from './order.entity';
import { Product } from '../../product/entity/product.entity';

@Entity('order_items')
@Index(['order', 'product'], { unique: true })
export class OrderItem extends BaseEntity {
  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  // Product details at time of order (snapshot)
  @Column({
    type: 'varchar',
    nullable: false,
    name: 'product_name',
    length: 255,
  })
  productName: string;

  @Column({ type: 'varchar', nullable: true, name: 'product_sku', length: 100 })
  productSku: string | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    name: 'unit_price',
  })
  unitPrice: number; // Price at time of order

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'discounted_price',
  })
  discountedPrice: number | null; // Discounted price at time of order

  @Column({ type: 'int', nullable: false, name: 'quantity' })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    name: 'subtotal',
  })
  subtotal: number; // quantity * (discountedPrice || unitPrice)

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    default: 0,
    name: 'tax_amount',
  })
  taxAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    name: 'total',
  })
  total: number; // subtotal + taxAmount

  /**
   * Automatically calculates subtotal and total based on quantity and prices
   */
  @BeforeInsert()
  @BeforeUpdate()
  calculateTotals() {
    // Calculate subtotal: quantity * (discountedPrice if available, otherwise unitPrice)
    const priceToUse = this.discountedPrice || this.unitPrice;
    this.subtotal = Number(
      (Number(this.quantity) * Number(priceToUse)).toFixed(2),
    );

    // Calculate total: subtotal + taxAmount
    this.total = Number(
      (Number(this.subtotal) + Number(this.taxAmount || 0)).toFixed(2),
    );
  }
}
