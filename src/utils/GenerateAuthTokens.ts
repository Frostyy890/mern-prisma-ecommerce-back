import jwt from "jsonwebtoken";
import configuration from "../config/configuration";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};
export const generateAuthTokens = (payload: object): AuthTokens => {
  const { access_token, refresh_token } = configuration.jwt;
  const accessToken = jwt.sign(payload, access_token.secret, {
    expiresIn: access_token.expiry,
  });
  const refreshToken = jwt.sign(payload, refresh_token.secret, {
    expiresIn: refresh_token.expiry,
  });

  return { accessToken, refreshToken };
};
