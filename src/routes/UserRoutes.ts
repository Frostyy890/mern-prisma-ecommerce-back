import { Router } from "express";
import UserRepository from "../repositories/UserRepository";
import UserService from "../services/UserService";
import UserController from "../controllers/UserController";
import ValidateRequest from "../middlewares/ValidateRequest";
import { createUserSchema, updateUserSchema } from "../validations/UserValidations";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const router = Router();

router
	.get("/", userController.getAll.bind(userController))
	.get("/:id", userController.getById.bind(userController))
	.post("/", ValidateRequest(createUserSchema), userController.create.bind(userController))
	.patch("/:id", ValidateRequest(updateUserSchema), userController.update.bind(userController))
	.delete("/:id", userController.delete.bind(userController));

export { router as UserRoutes };
