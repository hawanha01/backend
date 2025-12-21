import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entity/base.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Entity('orders')
@Index(['orderNumber'], { unique: true })
@Index(['buyerEmail'])
@Index(['buyerPhoneNumber'])
@Index(['status'])
export class Order extends BaseEntity {
  @Column({
    type: 'varchar',
    nullable: false,
    name: 'order_number',
    length: 100,
    unique: true,
  })
  orderNumber: string;

  // Buyer details (stored directly in order for online orders)
  @Column({ type: 'varchar', nullable: false, name: 'buyer_name', length: 255 })
  buyerName: string;

  @Column({
    type: 'varchar',
    nullable: false,
    name: 'buyer_email',
    length: 255,
  })
  buyerEmail: string;

  @Column({
    type: 'varchar',
    nullable: false,
    name: 'buyer_phone_number',
    length: 20,
  })
  buyerPhoneNumber: string;

  // Billing Address
  @Column({
    type: 'varchar',
    nullable: false,
    name: 'billing_address',
    length: 255,
  })
  billingAddress: string;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'billing_address_line2',
    length: 255,
  })
  billingAddressLine2: string | null;

  @Column({
    type: 'varchar',
    nullable: false,
    name: 'billing_city',
    length: 100,
  })
  billingCity: string;

  @Column({
    type: 'varchar',
    nullable: false,
    name: 'billing_state',
    length: 100,
  })
  billingState: string;

  @Column({
    type: 'varchar',
    nullable: false,
    name: 'billing_zip_code',
    length: 20,
  })
  billingZipCode: string;

  @Column({
    type: 'varchar',
    nullable: false,
    name: 'billing_country',
    length: 100,
  })
  billingCountry: string;

  // Shipping Address (can be different from billing)
  @Column({
    type: 'varchar',
    nullable: false,
    name: 'shipping_address',
    length: 255,
  })
  shippingAddress: string;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'shipping_address_line2',
    length: 255,
  })
  shippingAddressLine2: string | null;

  @Column({
    type: 'varchar',
    nullable: false,
    name: 'shipping_city',
    length: 100,
  })
  shippingCity: string;

  @Column({
    type: 'varchar',
    nullable: false,
    name: 'shipping_state',
    length: 100,
  })
  shippingState: string;

  @Column({
    type: 'varchar',
    nullable: false,
    name: 'shipping_zip_code',
    length: 20,
  })
  shippingZipCode: string;

  @Column({
    type: 'varchar',
    nullable: false,
    name: 'shipping_country',
    length: 100,
  })
  shippingCountry: string;

  // Order totals
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    name: 'subtotal',
  })
  subtotal: number;

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
    default: 0,
    name: 'shipping_cost',
  })
  shippingCost: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    default: 0,
    name: 'discount_amount',
  })
  discountAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    name: 'total_amount',
  })
  totalAmount: number;

  // Order status
  @Column({
    type: 'varchar',
    nullable: false,
    name: 'status',
    length: 50,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  // Payment information
  @Column({
    type: 'varchar',
    nullable: true,
    name: 'payment_method',
    length: 50,
  })
  paymentMethod: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'payment_status',
    length: 50,
  })
  paymentStatus: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'transaction_id',
    length: 255,
  })
  transactionId: string | null;

  // Shipping information
  @Column({
    type: 'varchar',
    nullable: true,
    name: 'tracking_number',
    length: 255,
  })
  trackingNumber: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'shipping_carrier',
    length: 100,
  })
  shippingCarrier: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'shipped_at' })
  shippedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'delivered_at' })
  deliveredAt: Date | null;

  // Notes
  @Column({ type: 'text', nullable: true, name: 'notes' })
  notes: string | null;

  @Column({ type: 'text', nullable: true, name: 'internal_notes' })
  internalNotes: string | null;

  // Relationship with OrderItems
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  orderItems: OrderItem[];
}
