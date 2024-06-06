import { Router } from "express";
import UserController from "../controllers/UserController";
import ValidateRequest from "../middlewares/ValidateRequest";
import { createUserSchema, updateUserSchema } from "../validations/UserValidations";
import Auth from "../middlewares/Auth";

const userController = new UserController();
const authMiddleware = new Auth();
const router = Router();

router
  .get("/", userController.getAll.bind(userController))
  .get("/:id", userController.getById.bind(userController))
  .post("/", ValidateRequest(createUserSchema), userController.create.bind(userController))
  .patch("/:id", ValidateRequest(updateUserSchema), userController.update.bind(userController))
  .delete(
    "/:id",
    authMiddleware.verifyPermissions("delete"),
    userController.delete.bind(userController)
  );

export { router as UserRoutes };
