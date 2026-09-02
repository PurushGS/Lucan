import type { LogtoNextConfig } from "@logto/next";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const logtoConfig: LogtoNextConfig = {
  endpoint: requiredEnv("LOGTO_ENDPOINT"),
  appId: requiredEnv("LOGTO_APP_ID"),
  appSecret: requiredEnv("LOGTO_APP_SECRET"),
  baseUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  cookieSecret: requiredEnv("LOGTO_COOKIE_SECRET"),
  cookieSecure: process.env.NODE_ENV === "production",
};
