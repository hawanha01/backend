import { Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entity/base.entity';
import { UserStore } from '../../user-store/entity/user-store.entity';
import { Permission } from '../../permission/entity/permission.entity';

@Entity('user_store_permissions')
@Index(['userStore', 'permission'], { unique: true })
export class UserStorePermission extends BaseEntity {
  @ManyToOne(() => UserStore, (userStore) => userStore.userStorePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_store_id' })
  userStore: UserStore;

  @ManyToOne(
    () => Permission,
    (permission) => permission.userStorePermissions,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}
