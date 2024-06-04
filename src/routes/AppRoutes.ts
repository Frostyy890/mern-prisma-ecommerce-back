import { Router } from "express";
import { UserRoutes } from "./UserRoutes";
import { AuthRoutes } from "./AuthRoutes";

const router = Router();
router.use("/users", UserRoutes);
router.use("/auth", AuthRoutes);
export { router as AppRoutes };
