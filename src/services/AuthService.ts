import type { Role } from "@prisma/client";
import bcrypt from "bcrypt";
import UserService from "./UserService";
import { JwtService, type AuthTokens } from "./JWTService";
import type { LoginUserInput, RegisterUserInput } from "../validations/UserValidations";
import { HttpException, HttpStatusCodes } from "../utils/HttpExceptions";
import configuration from "../config/configuration";

const userService = new UserService();
const jwtService = new JwtService();

export default class AuthService {
  private readonly userService: UserService;
  private readonly jwtService: JwtService;
  constructor() {
    this.userService = userService;
    this.jwtService = jwtService;
  }
  async login(data: LoginUserInput): Promise<AuthTokens> {
    let user;
    if (data.phone) user = await this.userService.getByKey("phone", data.phone);
    else user = await this.userService.getByKey("email", data.email);
    if (!user || !(await bcrypt.compare(data.password, user.password)))
      throw new HttpException(HttpStatusCodes.BAD_REQUEST, "Bad request");
    const { email, roles } = user;
    const { accessToken, refreshToken } = this.jwtService.genAuthTokens({ email, roles });
    await this.userService.update(user.id, { refreshToken });
    return { accessToken, refreshToken };
  }
  async register(data: RegisterUserInput): Promise<AuthTokens> {
    const newUser = await this.userService.create(data);
    const { email, roles } = newUser;
    const { accessToken, refreshToken } = this.jwtService.genAuthTokens({ email, roles });
    await this.userService.update(newUser.id, { refreshToken });
    return { accessToken, refreshToken };
  }
  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    const user = await this.userService.getByKey("refreshToken", refreshToken);
    if (!user) throw new HttpException(HttpStatusCodes.FORBIDDEN, "Forbidden");
    const decoded = await this.jwtService.verify(
      refreshToken,
      configuration.jwt.refresh_token.secret
    );
    const isRolesMatch = user.roles.every((role: Role) => decoded.roles.includes(role));
    if (decoded.email !== user.email || !isRolesMatch)
      throw new HttpException(HttpStatusCodes.FORBIDDEN, "Forbidden");
    const { accessToken } = this.jwtService.genAuthTokens({ email: user.email, roles: user.roles });
    return { accessToken };
  }
  async logout(refreshToken: string) {
    const user = await this.userService.getByKey("refreshToken", refreshToken);
    if (user) return await this.userService.update(user.id, { refreshToken: "" });
  }
}
