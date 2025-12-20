import {
  Entity,
  Column,
  OneToMany,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { UserStore } from '../../user-store/entity/user-store.entity';
import { BaseEntity } from '../../../database/entity/base.entity';
import { Role } from '../enum/role.enum';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
@Index(['role'])
export class User extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    name: 'email',
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    name: 'username',
    unique: true,
  })
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'password' })
  password: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'refresh_token',
  })
  refreshToken: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    default: Role.STORE_OWNER,
    name: 'role',
  })
  role: Role;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'last_name' })
  lastName: string;

  @Column({ type: 'varchar', length: 510, nullable: false, name: 'full_name' })
  fullName: string;

  @Column({ type: 'varchar', length: 20, nullable: false, name: 'phone' })
  phone: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'avatar' })
  avatar: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'is_email_verified',
  })
  isEmailVerified: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'last_login_at' })
  lastLoginAt: Date;

  @OneToMany(() => UserStore, (userStore) => userStore.user, { cascade: true })
  userStores: UserStore[];

  @BeforeInsert()
  @BeforeUpdate()
  updateFullName() {
    const parts = [this.firstName, this.lastName].filter(Boolean);
    this.fullName = parts.length > 0 ? parts.join(' ').trim() : '';
  }
}
