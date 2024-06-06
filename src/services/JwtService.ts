import jwt from "jsonwebtoken";
import configuration from "../config/configuration";
import { HttpException, HttpStatusCodes } from "../utils/HttpExceptions";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export class JwtService {
  genAuthTokens(payload: object): AuthTokens {
    const { access_token, refresh_token } = configuration.jwt;
    const accessToken = this.sign(payload, access_token.secret, {
      expiresIn: access_token.expiry,
    });
    const refreshToken = this.sign(payload, refresh_token.secret, {
      expiresIn: refresh_token.expiry,
    });
    return { accessToken, refreshToken };
  }
  async verify(token: string, secret: string): Promise<jwt.JwtPayload> {
    const decoded: jwt.JwtPayload = await new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) reject(new HttpException(HttpStatusCodes.FORBIDDEN, "Forbidden"));
        else resolve(decoded as jwt.JwtPayload);
      });
    });
    return decoded;
  }
  sign(payload: object, secret: string, options?: jwt.SignOptions): string {
    return jwt.sign(payload, secret, options);
  }
}
