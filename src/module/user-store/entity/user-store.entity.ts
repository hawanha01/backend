import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { Store } from '../../store/entity/store.entity';
import { BaseEntity } from '../../../database/entity/base.entity';
import { UserStorePermission } from '../../user-store-permission/entity/user-store-permission.entity';
import { Role } from '../../user/enum/role.enum';

@Entity('user_stores')
@Index(['user', 'store'], { unique: true })
@Index(['role'])
export class UserStore extends BaseEntity {
  @ManyToOne(() => User, (user) => user.userStores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Store, (store) => store.userStores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  /**
   * Role of the user in this specific store
   * - store_owner: Has all permissions for this store
   * - store_manager: Permissions are managed by store_owner via UserStorePermission
   */
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    default: Role.STORE_OWNER,
    name: 'role',
  })
  role: Role;

  @OneToMany(
    () => UserStorePermission,
    (userStorePermission) => userStorePermission.userStore,
    { cascade: true },
  )
  userStorePermissions: UserStorePermission[];
}
