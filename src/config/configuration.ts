import dotenv from "dotenv";
import { type CookieOptions } from "express";
import { z } from "zod";

dotenv.config();

export enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

const cookie_options: CookieOptions = {
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000,
  sameSite: "none",
  secure: process.env.NODE_ENV === "production",
};

const isValidEnv = (env: string | undefined): env is Environment => {
  if (!env) return false;
  return Object.values(Environment).includes(env as Environment);
};

const configurationSchema = z.object({
  app: z.object({
    env: z
      .enum([Environment.Development, Environment.Production, Environment.Test])
      .default(Environment.Development),
    port: z.number(),
  }),
  jwt: z.object({
    access_token: z.object({
      secret: z.string(),
      expiry: z.string(),
    }),
    refresh_token: z.object({
      secret: z.string(),
      expiry: z.string(),
      cookie_options: z.object({}),
    }),
    token_type: z.string(),
  }),
  bcrypt: z.object({
    salt_rounds: z.number(),
  }),
});

export type ConfigurationType = z.infer<typeof configurationSchema>;

const configuration: ConfigurationType = {
  app: {
    env: isValidEnv(process.env.NODE_ENV) ? process.env.NODE_ENV : Environment.Development,
    port: parseInt(process.env.PORT ?? "3000"),
  },
  jwt: {
    access_token: {
      secret: process.env.ACCESS_TOKEN_SECRET ?? "access_token_secret",
      expiry: process.env.ACCESS_TOKEN_EXPIRY ?? "60s",
    },

    refresh_token: {
      secret: process.env.REFRESH_TOKEN_SECRET ?? "refresh_token_secret",
      expiry: process.env.REFRESH_TOKEN_EXPIRY ?? "1h",
      cookie_options,
    },
    token_type: process.env.TOKEN_TYPE ?? "Bearer",
  },
  bcrypt: {
    salt_rounds: parseInt(process.env.SALT_ROUNDS ?? "10"),
  },
};
export default configuration;
