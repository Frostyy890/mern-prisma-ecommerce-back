import type { Request, Response, NextFunction } from "express";
import { HttpException, HttpStatusCodes } from "../utils/HttpExceptions";
import jwt from "jsonwebtoken";
import configuration from "../config/configuration";
import { Role } from "@prisma/client";
import { getPermissionsByRoles } from "../config/permissions";

export interface AuthRequest extends Request {
  user?: {
    email: string;
    roles: Role[];
  };
}

export default class Auth {
  verifyToken(req: AuthRequest, _res: Response, next: NextFunction): void {
    const { authorization } = req.headers;
    if (!authorization) throw new HttpException(HttpStatusCodes.UNAUTHORIZED, "Unauthorized");
    const [type, token] = authorization.split(" ");
    if (type !== configuration.jwt.token_type)
      throw new HttpException(HttpStatusCodes.UNAUTHORIZED, "Unauthorized");
    jwt.verify(token, configuration.jwt.access_token.secret, (err, decoded) => {
      if (err) throw new HttpException(HttpStatusCodes.FORBIDDEN, "Forbidden");
      req.user = decoded as { email: string; roles: Role[] };
      next();
    });
  }
  verifyRoles(allowedRoles: Role[]) {
    return (req: AuthRequest, _res: Response, next: NextFunction): void => {
      if (!req.user || !req.user?.roles)
        throw new HttpException(HttpStatusCodes.FORBIDDEN, "Forbidden");
      const hasRoles = req.user.roles.some((role) => allowedRoles.includes(role));
      if (!hasRoles) throw new HttpException(HttpStatusCodes.FORBIDDEN, "Forbidden");
      next();
    };
  }
  verifyPermissions(permission: string) {
    return (req: AuthRequest, _res: Response, next: NextFunction): void => {
      if (!req.user || !req.user?.roles)
        throw new HttpException(HttpStatusCodes.FORBIDDEN, "Forbidden");
      const userPermissions = getPermissionsByRoles(req.user.roles);
      if (!userPermissions || !userPermissions.includes(permission))
        throw new HttpException(HttpStatusCodes.FORBIDDEN, `You are forbidden to ${permission}`);
      next();
    };
  }
}
