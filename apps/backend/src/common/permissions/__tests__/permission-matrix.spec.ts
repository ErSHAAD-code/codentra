import { hasPermission } from '../permission-matrix';

describe('permission-matrix', () => {
  it('grants OWNER every defined permission', () => {
    const allPermissions = [
      'repository:create', 'repository:delete', 'member:invite', 'member:remove',
      'review:approve', 'analytics:view', 'billing:manage', 'ai:configure',
    ] as const;
    for (const permission of allPermissions) {
      expect(hasPermission('OWNER', permission)).toBe(true);
    }
  });

  it('grants GUEST no permissions', () => {
    expect(hasPermission('GUEST', 'analytics:view')).toBe(false);
    expect(hasPermission('GUEST', 'repository:create')).toBe(false);
  });

  it('does not let VIEWER create or delete repositories', () => {
    expect(hasPermission('VIEWER', 'repository:create')).toBe(false);
    expect(hasPermission('VIEWER', 'repository:delete')).toBe(false);
  });

  it('lets VIEWER view analytics (read-only role)', () => {
    expect(hasPermission('VIEWER', 'analytics:view')).toBe(true);
  });

  it('does not let ADMIN manage billing (owner-only)', () => {
    expect(hasPermission('ADMIN', 'billing:manage')).toBe(false);
  });

  it('returns false for an unknown role rather than throwing', () => {
    expect(hasPermission('NOT_A_REAL_ROLE', 'analytics:view')).toBe(false);
  });

  it('lets DEVELOPER create repositories but not remove members', () => {
    expect(hasPermission('DEVELOPER', 'repository:create')).toBe(true);
    expect(hasPermission('DEVELOPER', 'member:remove')).toBe(false);
  });
});
