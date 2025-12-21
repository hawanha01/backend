import { PermissionCode } from '../enum/permission-code.enum';
import { PermissionAction } from '../enum/permission-action.enum';

/**
 * Maps permission codes to their allowed actions
 * This defines which actions are valid for each permission code
 */
export const PERMISSION_CODE_ACTION_MAPPING: Record<
  PermissionCode,
  PermissionAction[]
> = {
  // Admin permissions
  [PermissionCode.ADMIN_MANAGE]: [
    PermissionAction.READ,
    PermissionAction.CREATE,
    PermissionAction.UPDATE,
    PermissionAction.DELETE,
    PermissionAction.MANAGE,
  ],
  [PermissionCode.ADMIN_CREATE_STORE_OWNER]: [PermissionAction.CREATE],
  [PermissionCode.ADMIN_MANAGE_STORE_OWNERS]: [
    PermissionAction.READ,
    PermissionAction.UPDATE,
    PermissionAction.DELETE,
    PermissionAction.MANAGE,
  ],
  [PermissionCode.ADMIN_VIEW_ALL_STORES]: [
    PermissionAction.READ,
    PermissionAction.VIEW,
  ],
  [PermissionCode.ADMIN_MANAGE_SYSTEM]: [
    PermissionAction.READ,
    PermissionAction.UPDATE,
    PermissionAction.SETTINGS,
    PermissionAction.MANAGE,
  ],

  // Product permissions
  [PermissionCode.PRODUCTS_MANAGE]: [
    PermissionAction.CREATE,
    PermissionAction.READ,
    PermissionAction.UPDATE,
    PermissionAction.DELETE,
    PermissionAction.MANAGE,
  ],
  [PermissionCode.PRODUCTS_CREATE]: [PermissionAction.CREATE],
  [PermissionCode.PRODUCTS_READ]: [PermissionAction.READ],
  [PermissionCode.PRODUCTS_UPDATE]: [PermissionAction.UPDATE],
  [PermissionCode.PRODUCTS_DELETE]: [PermissionAction.DELETE],

  // Order permissions
  [PermissionCode.ORDERS_MANAGE]: [
    PermissionAction.CREATE,
    PermissionAction.READ,
    PermissionAction.UPDATE,
    PermissionAction.DELETE,
    PermissionAction.CANCEL,
    PermissionAction.MANAGE,
  ],
  [PermissionCode.ORDERS_CREATE]: [PermissionAction.CREATE],
  [PermissionCode.ORDERS_READ]: [PermissionAction.READ],
  [PermissionCode.ORDERS_UPDATE]: [PermissionAction.UPDATE],
  [PermissionCode.ORDERS_DELETE]: [PermissionAction.DELETE],
  [PermissionCode.ORDERS_CANCEL]: [PermissionAction.CANCEL],

  // Store permissions
  [PermissionCode.STORE_MANAGE]: [
    PermissionAction.READ,
    PermissionAction.UPDATE,
    PermissionAction.SETTINGS,
    PermissionAction.ANALYTICS,
    PermissionAction.MANAGE,
  ],
  [PermissionCode.STORE_SETTINGS]: [
    PermissionAction.READ,
    PermissionAction.UPDATE,
    PermissionAction.SETTINGS,
  ],
  [PermissionCode.STORE_ANALYTICS]: [
    PermissionAction.READ,
    PermissionAction.VIEW,
    PermissionAction.ANALYTICS,
  ],

  // User permissions
  [PermissionCode.USERS_MANAGE]: [
    PermissionAction.READ,
    PermissionAction.INVITE,
    PermissionAction.REMOVE,
    PermissionAction.MANAGE,
  ],
  [PermissionCode.USERS_INVITE]: [PermissionAction.INVITE],
  [PermissionCode.USERS_REMOVE]: [PermissionAction.REMOVE],

  // Category permissions
  [PermissionCode.CATEGORIES_MANAGE]: [
    PermissionAction.CREATE,
    PermissionAction.READ,
    PermissionAction.UPDATE,
    PermissionAction.DELETE,
    PermissionAction.MANAGE,
  ],
  [PermissionCode.CATEGORIES_CREATE]: [PermissionAction.CREATE],
  [PermissionCode.CATEGORIES_UPDATE]: [PermissionAction.UPDATE],
  [PermissionCode.CATEGORIES_DELETE]: [PermissionAction.DELETE],

  // Inventory permissions
  [PermissionCode.INVENTORY_MANAGE]: [
    PermissionAction.READ,
    PermissionAction.UPDATE,
    PermissionAction.MANAGE,
  ],
  [PermissionCode.INVENTORY_UPDATE]: [
    PermissionAction.READ,
    PermissionAction.UPDATE,
  ],

  // Payment permissions
  [PermissionCode.PAYMENTS_MANAGE]: [
    PermissionAction.READ,
    PermissionAction.VIEW,
    PermissionAction.MANAGE,
  ],
  [PermissionCode.PAYMENTS_VIEW]: [
    PermissionAction.READ,
    PermissionAction.VIEW,
  ],

  // Reports permissions
  [PermissionCode.REPORTS_VIEW]: [PermissionAction.READ, PermissionAction.VIEW],
  [PermissionCode.REPORTS_EXPORT]: [
    PermissionAction.READ,
    PermissionAction.VIEW,
    PermissionAction.EXPORT,
  ],
};

/**
 * Get allowed actions for a specific permission code
 */
export function getAllowedActionsForCode(
  code: PermissionCode,
): PermissionAction[] {
  return PERMISSION_CODE_ACTION_MAPPING[code] || [];
}

/**
 * Check if a specific action is allowed for a permission code
 */
export function isActionAllowedForCode(
  code: PermissionCode,
  action: PermissionAction,
): boolean {
  const allowedActions = getAllowedActionsForCode(code);
  return allowedActions.includes(action);
}

/**
 * Get all permission codes for a specific resource
 */
export function getCodesByResource(resource: string): PermissionCode[] {
  return Object.keys(PERMISSION_CODE_ACTION_MAPPING).filter((code) =>
    code.startsWith(resource.toLowerCase()),
  ) as PermissionCode[];
}
