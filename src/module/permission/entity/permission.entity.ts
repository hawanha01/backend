import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entity/base.entity';
import { UserStorePermission } from '../../user-store-permission/entity/user-store-permission.entity';
import { PermissionCode } from '../enum/permission-code.enum';
import { PermissionAction } from '../enum/permission-action.enum';

@Entity('permissions')
@Index(['code','action'], { unique: true })
export class Permission extends BaseEntity {
  @Column({ type: 'varchar', nullable: false, name: 'name', length: 255 })
  name: string;

  @Column({
    type: 'varchar',
    nullable: false,
    name: 'code',
    length: 100,
  })
  code: PermissionCode;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'action',
    length: 50,
  })
  action: PermissionAction;

  @Column({ type: 'jsonb', nullable: true, name: 'allowed_actions' })
  allowedActions: PermissionAction[];

  @OneToMany(
    () => UserStorePermission,
    (userStorePermission) => userStorePermission.permission,
    { cascade: true },
  )
  userStorePermissions: UserStorePermission[];
}
