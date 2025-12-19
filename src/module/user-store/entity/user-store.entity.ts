import {
  Entity,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { Store } from '../../store/entity/store.entity';
import { BaseEntity } from '../../../database/entity/base.entity';
import { UserStorePermission } from '../../user-store-permission/entity/user-store-permission.entity';

@Entity('user_stores')
@Index(['user', 'store'], { unique: true })
export class UserStore extends BaseEntity {
  @ManyToOne(() => User, (user) => user.userStores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Store, (store) => store.userStores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @OneToMany(() => UserStorePermission, (userStorePermission) => userStorePermission.userStore, { cascade: true })
  userStorePermissions: UserStorePermission[];
}
