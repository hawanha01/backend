import { Entity, Column, OneToMany, Index } from 'typeorm';
import { UserStore } from '../../user-store/entity/user-store.entity';
import { Product } from '../../product/entity/product.entity';
import { Review } from '../../review/entity/review.entity';
import { BaseEntity } from '../../../database/entity/base.entity';

@Entity('stores')
@Index(['slug'], { unique: true })
@Index(['email'], { unique: true })
@Index(['phoneNumber'], { unique: true })
@Index(['website'], { unique: true })
export class Store extends BaseEntity {
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

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'logo' })
  logo: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'banner' })
  banner: string;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'address' })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: false, name: 'city' })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: false, name: 'state' })
  state: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'zip_code' })
  zipCode: string;

  @Column({ type: 'varchar', length: 100, nullable: false, name: 'country' })
  country: string;

  @Column({
    type: 'varchar',
    nullable: false,
    name: 'phone_number',
    length: 20,
  })
  phoneNumber: string;

  @Column({ type: 'varchar', nullable: false, name: 'email', length: 255 })
  email: string;

  @Column({ type: 'varchar', nullable: false, name: 'website', length: 500 })
  website: string;

  @OneToMany(() => UserStore, (userStore) => userStore.store, { cascade: true })
  userStores: UserStore[];

  @OneToMany(() => Product, (product) => product.store, { cascade: true })
  products: Product[];

  @OneToMany(() => Review, (review) => review.store, { cascade: true })
  reviews: Review[];
}
