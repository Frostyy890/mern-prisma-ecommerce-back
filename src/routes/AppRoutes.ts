import { Router } from "express";
import { UserRoutes } from "./UserRoutes";
import { AuthRoutes } from "./AuthRoutes";
import Auth from "../middlewares/Auth";
import { Role } from "@prisma/client";

const router = Router();
const authMiddleware = new Auth();
router.use(
  "/users",
  authMiddleware.verifyToken,
  authMiddleware.verifyRoles([Role.MANAGER, Role.ADMIN]),
  UserRoutes
);
router.use("/auth", AuthRoutes);
export { router as AppRoutes };
