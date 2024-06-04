import type { Request, Response, NextFunction } from "express";
import type AuthService from "../services/AuthService";
import configuration from "../config/configuration";
import { HttpStatusCodes } from "../utils/HttpExceptions";

const { cookie_options } = configuration.jwt.refresh_token;

export default class AuthController {
  constructor(private readonly authService: AuthService) {}
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken } = await this.authService.login(req.body);
      res
        .cookie("jwt", refreshToken, cookie_options)
        .status(HttpStatusCodes.OK)
        .send({ accessToken });
    } catch (err) {
      next(err);
    }
  }
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken } = await this.authService.register(req.body);
      res
        .cookie("jwt", refreshToken, cookie_options)
        .status(HttpStatusCodes.CREATED)
        .send({ accessToken });
    } catch (err) {
      next(err);
    }
  }
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken } = await this.authService.refresh(req.cookies.jwt);
      res.status(HttpStatusCodes.OK).send({ accessToken });
    } catch (err) {
      next(err);
    }
  }
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { NO_CONTENT } = HttpStatusCodes;
      const refreshToken = req.cookies.jwt;
      if (!refreshToken) {
        res.sendStatus(NO_CONTENT);
        return;
      }
      const user = await this.authService.logout(refreshToken);
      if (user) {
        res.clearCookie("jwt", cookie_options).sendStatus(NO_CONTENT);
        return;
      }
      res.clearCookie("jwt", cookie_options).sendStatus(NO_CONTENT);
    } catch (err) {
      next(err);
    }
  }
}
