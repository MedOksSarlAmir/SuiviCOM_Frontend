export function requireRole(userRole: string, allowed: string[]) {
  return allowed.includes(userRole);
}
