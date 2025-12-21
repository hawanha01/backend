import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entity/base.entity';
import { Store } from '../../store/entity/store.entity';
import { Product } from '../../product/entity/product.entity';
import { Rating } from '../enum/rating.enum';

@Entity('reviews')
@Index(['store'])
@Index(['product'])
@Index(['rating'])
@Index(['isApproved'])
export class Review extends BaseEntity {
  @Column({
    type: 'varchar',
    nullable: true,
    name: 'reviewer_name',
    length: 255,
  })
  reviewerName: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'reviewer_email',
    length: 255,
  })
  reviewerEmail: string | null;

  @Column({
    type: 'int',
    nullable: false,
    name: 'rating',
    enum: Rating,
  })
  rating: Rating;

  @Column({ type: 'text', nullable: true, name: 'title' })
  title: string | null;

  @Column({ type: 'text', nullable: true, name: 'comment' })
  comment: string | null;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'is_approved',
  })
  isApproved: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'is_verified_purchase',
  })
  isVerifiedPurchase: boolean;

  @Column({ type: 'int', nullable: false, default: 0, name: 'helpful_count' })
  helpfulCount: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
    name: 'not_helpful_count',
  })
  notHelpfulCount: number;

  // Review can be for either a Store or a Product
  @ManyToOne(() => Store, (store) => store.reviews, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'store_id' })
  store: Store | null;

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'product_id' })
  product: Product | null;
}
