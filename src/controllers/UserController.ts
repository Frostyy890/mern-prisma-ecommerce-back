import type { NextFunction, Request, Response } from "express";
import type UserService from "../services/UserService";
import { HttpStatusCodes } from "../utils/HttpExceptions";
export default class UserController {
  constructor(private readonly userService: UserService) {}
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.getAll();
      res.status(HttpStatusCodes.OK).json({ users });
    } catch (err) {
      next(err);
    }
  }
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.getById(req.params.id);
      res.status(HttpStatusCodes.OK).json({ user });
    } catch (err) {
      next(err);
    }
  }
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.create(req.body);
      res.status(HttpStatusCodes.CREATED).json({ user });
    } catch (err) {
      next(err);
    }
  }
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.update(req.params.id, req.body);
      res.status(HttpStatusCodes.OK).json({ user });
    } catch (err) {
      next(err);
    }
  }
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.userService.delete(req.params.id);
      res.sendStatus(HttpStatusCodes.NO_CONTENT);
    } catch (err) {
      next(err);
    }
  }
}
