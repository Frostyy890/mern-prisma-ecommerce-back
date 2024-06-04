import { Role } from "@prisma/client";

type Permissions = {
  [key: string]: {
    [key: string]: string;
  };
};

export const permissions: Permissions = {
  basic: {
    read: "read",
    create: "create",
    update: "update",
    delete: "delete",
  },
};

const userPermissions = [permissions.basic.read];
const managerPermissions = [...userPermissions, permissions.basic.create, permissions.basic.update];
const adminPermissions = [...managerPermissions, permissions.basic.delete];

const permissionsByRole = {
  [Role.USER]: userPermissions,
  [Role.MANAGER]: managerPermissions,
  [Role.ADMIN]: adminPermissions,
};

export const getPermissionsByRoles = (roles: Role[]) => {
  const permissionsSet = new Set<string>();
  roles.forEach((role) => {
    permissionsByRole[role].forEach((permission) => {
      permissionsSet.add(permission);
    });
  });
  const permissions = Array.from(permissionsSet);
  if (permissions.length === 0) return null;
  return permissions;
};
