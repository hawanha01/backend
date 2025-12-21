export enum PermissionCode {
  // Admin permissions
  ADMIN_MANAGE = 'admin.manage',
  ADMIN_CREATE_STORE_OWNER = 'admin.create_store_owner',
  ADMIN_MANAGE_STORE_OWNERS = 'admin.manage_store_owners',
  ADMIN_VIEW_ALL_STORES = 'admin.view_all_stores',
  ADMIN_MANAGE_SYSTEM = 'admin.manage_system',

  // Product permissions
  PRODUCTS_MANAGE = 'products.manage',
  PRODUCTS_CREATE = 'products.create',
  PRODUCTS_READ = 'products.read',
  PRODUCTS_UPDATE = 'products.update',
  PRODUCTS_DELETE = 'products.delete',

  // Order permissions
  ORDERS_MANAGE = 'orders.manage',
  ORDERS_CREATE = 'orders.create',
  ORDERS_READ = 'orders.read',
  ORDERS_UPDATE = 'orders.update',
  ORDERS_DELETE = 'orders.delete',
  ORDERS_CANCEL = 'orders.cancel',

  // Store permissions
  STORE_MANAGE = 'store.manage',
  STORE_SETTINGS = 'store.settings',
  STORE_ANALYTICS = 'store.analytics',

  // User permissions
  USERS_MANAGE = 'users.manage',
  USERS_INVITE = 'users.invite',
  USERS_REMOVE = 'users.remove',

  // Category permissions
  CATEGORIES_MANAGE = 'categories.manage',
  CATEGORIES_CREATE = 'categories.create',
  CATEGORIES_UPDATE = 'categories.update',
  CATEGORIES_DELETE = 'categories.delete',

  // Inventory permissions
  INVENTORY_MANAGE = 'inventory.manage',
  INVENTORY_UPDATE = 'inventory.update',

  // Payment permissions
  PAYMENTS_MANAGE = 'payments.manage',
  PAYMENTS_VIEW = 'payments.view',

  // Reports permissions
  REPORTS_VIEW = 'reports.view',
  REPORTS_EXPORT = 'reports.export',
}
