export function hasUserPermission(user, permission) {
  if (!user?.employee?.roles) return false;
  const allPermissions = user.employee.roles.flatMap((r) => r.role.permissions);
  return allPermissions.includes(permission);
}
