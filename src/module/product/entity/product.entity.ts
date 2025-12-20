import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { BaseEntity } from '../../../database/entity/base.entity';
import { Store } from '../../store/entity/store.entity';
import { Review } from '../../review/entity/review.entity';
import { OrderItem } from '../../order/entity/order-item.entity';

@Entity('products')
@Index(['slug'], { unique: true })
@Index(['store'])
@Index(['isFeatured'])
export class Product extends BaseEntity {
  @Column({ type: 'varchar', nullable: false, name: 'name', length: 255 })
  name: string;

  @Column({
    type: 'varchar',
    nullable: false,
    name: 'slug',
    length: 255,
    unique: true,
  })
  slug: string;

  @Column({ type: 'text', nullable: true, name: 'description' })
  description: string;

  @Column({ type: 'text', nullable: true, name: 'short_description' })
  shortDescription: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    name: 'price',
  })
  price: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    name: 'discount_percentage',
    default: 0,
  })
  discountPercentage: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'discounted_price',
  })
  discountedPrice: number | null;

  @Column({ type: 'varchar', nullable: true, name: 'barcode', length: 100 })
  barcode: string | null;

  @Column({ type: 'int', nullable: false, default: 0, name: 'quantity' })
  quantity: number;

  @Column({ type: 'int', nullable: true, name: 'low_stock_threshold' })
  lowStockThreshold: number | null;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'is_featured' })
  isFeatured: boolean;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'is_digital' })
  isDigital: boolean;

  @Column({ type: 'int', nullable: false, default: 0, name: 'total_sales' })
  totalSales: number;

  @Column({ type: 'int', nullable: false, default: 0, name: 'view_count' })
  viewCount: number;

  @Column({ type: 'varchar', nullable: true, name: 'weight', length: 50 })
  weight: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'dimensions', length: 100 })
  dimensions: string | null;

  @Column({ type: 'jsonb', nullable: true, name: 'attributes' })
  attributes: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true, name: 'tags' })
  tags: string[] | null;

  @Column({ type: 'jsonb', nullable: true, name: 'images' })
  images: string[] | null;

  @Column({ type: 'varchar', nullable: true, name: 'meta_title', length: 255 })
  metaTitle: string | null;

  @Column({ type: 'text', nullable: true, name: 'meta_description' })
  metaDescription: string | null;

  @ManyToOne(() => Store, (store) => store.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @OneToMany(() => Review, (review) => review.product, { cascade: true })
  reviews: Review[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  /**
   * Automatically calculates discounted_price based on price and discount_percentage
   * Formula: discounted_price = price - (price * discount_percentage / 100)
   */
  @BeforeInsert()
  @BeforeUpdate()
  calculateDiscountedPrice() {
    if (
      this.discountPercentage !== null &&
      this.discountPercentage !== undefined &&
      this.discountPercentage > 0 &&
      this.discountPercentage <= 100 &&
      this.price
    ) {
      const discountAmount = (Number(this.price) * Number(this.discountPercentage)) / 100;
      this.discountedPrice = Number((Number(this.price) - discountAmount).toFixed(2));
    } else {
      this.discountedPrice = null;
    }
  }
}

