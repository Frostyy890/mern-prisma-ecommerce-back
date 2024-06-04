import { type Role } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateAuthTokens, type AuthTokens } from "../utils/GenerateAuthTokens";
import type UserService from "./UserService";
import type { LoginUserInput, RegisterUserInput } from "../validations/UserValidations";
import { HttpException, HttpStatusCodes } from "../utils/HttpExceptions";
import configuration from "../config/configuration";

export default class AuthService {
  constructor(private readonly userService: UserService) {}
  async login(data: LoginUserInput): Promise<AuthTokens> {
    let user;
    if (data.phone) user = await this.userService.getByKey("phone", data.phone);
    else user = await this.userService.getByKey("email", data.email);
    if (!user || !(await bcrypt.compare(data.password, user.password)))
      throw new HttpException(HttpStatusCodes.BAD_REQUEST, "Invalid credentials");
    const { email, roles } = user;
    const { accessToken, refreshToken } = generateAuthTokens({ email, roles });
    await this.userService.update(user.id, { refreshToken });
    return { accessToken, refreshToken };
  }
  async register(data: RegisterUserInput): Promise<AuthTokens> {
    const newUser = await this.userService.create(data);
    const { accessToken, refreshToken } = generateAuthTokens({
      email: newUser.email,
      roles: newUser.roles,
    });
    await this.userService.update(newUser.id, { refreshToken });
    return { accessToken, refreshToken };
  }
  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    const user = await this.userService.getByKey("refreshToken", refreshToken);
    if (!user) throw new HttpException(HttpStatusCodes.FORBIDDEN, "Forbidden");
    const decoded: jwt.JwtPayload = await new Promise((resolve, reject) => {
      jwt.verify(refreshToken, configuration.jwt.refresh_token.secret, (err, decoded) => {
        if (err) reject(new HttpException(HttpStatusCodes.FORBIDDEN, "Forbidden"));
        else resolve(decoded as jwt.JwtPayload);
      });
    });
    const isRolesMatch = user.roles.every((role: Role) => decoded.roles.includes(role));
    if (decoded.email !== user.email || !isRolesMatch)
      throw new HttpException(HttpStatusCodes.FORBIDDEN, "Forbidden");
    const { accessToken } = generateAuthTokens({ email: user.email, roles: user.roles });
    return { accessToken };
  }
  async logout(refreshToken: string) {
    const user = await this.userService.getByKey("refreshToken", refreshToken);
    if (user) return await this.userService.update(user.id, { refreshToken: "" });
  }
}
