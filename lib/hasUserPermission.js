export function hasUserPermission(user, permission) {
  // ADMIN bypass hết
  if (user?.userType === "ADMIN") return true;

  if (!user?.employee?.roles) return false;

  const allPermissions = user.employee.roles.flatMap((r) => r.role.permissions);
  return allPermissions.includes(permission);
}
