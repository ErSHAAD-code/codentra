export type Permission =
  | 'repository:create'
  | 'repository:delete'
  | 'member:invite'
  | 'member:remove'
  | 'review:approve'
  | 'analytics:view'
  | 'billing:manage'
  | 'ai:configure';

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  OWNER: ['repository:create', 'repository:delete', 'member:invite', 'member:remove', 'review:approve', 'analytics:view', 'billing:manage', 'ai:configure'],
  ADMIN: ['repository:create', 'repository:delete', 'member:invite', 'member:remove', 'review:approve', 'analytics:view', 'ai:configure'],
  MANAGER: ['repository:create', 'member:invite', 'review:approve', 'analytics:view'],
  DEVELOPER: ['repository:create', 'review:approve'],
  REVIEWER: ['review:approve', 'analytics:view'],
  VIEWER: ['analytics:view'],
  GUEST: [],
};

export function hasPermission(role: string, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
