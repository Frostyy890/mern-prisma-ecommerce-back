import { Router } from "express";
import AuthController from "../controllers/AuthController";
import AuthService from "../services/AuthService";
import UserService from "../services/UserService";
import UserRepository from "../repositories/UserRepository";
import ValidateRequest from "../middlewares/ValidateRequest";
import { loginUserSchema, registerUserSchema } from "../validations/UserValidations";

const router = Router();
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const authService = new AuthService(userService);
const authController = new AuthController(authService);

router
  .post("/login", ValidateRequest(loginUserSchema), authController.login.bind(authController))
  .post(
    "/register",
    ValidateRequest(registerUserSchema),
    authController.register.bind(authController)
  )
  .post("/refresh", authController.refresh.bind(authController))
  .post("/logout", authController.logout.bind(authController));

export { router as AuthRoutes };
