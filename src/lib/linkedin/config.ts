export const linkedInSetupMessage =
  "LinkedIn OAuth is not configured yet. Add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET, then restart the local server.";

export class LinkedInSetupError extends Error {
  constructor(message = linkedInSetupMessage) {
    super(message);
    this.name = "LinkedInSetupError";
  }
}

export type LinkedInConfig = {
  provider: "live" | "mock";
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string;
  apiVersion: string;
  baseUrl: string;
};

export function isLinkedInConfigured() {
  return getLinkedInProvider() === "mock" || Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
}

export function getLinkedInConfig(): LinkedInConfig {
  const provider = getLinkedInProvider();
  if (provider === "live" && (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET)) {
    throw new LinkedInSetupError();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
  return {
    provider,
    clientId: process.env.LINKEDIN_CLIENT_ID || "mock-linkedin-client",
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "mock-linkedin-secret",
    redirectUri: process.env.LINKEDIN_REDIRECT_URI || `${baseUrl}/api/linkedin/callback`,
    scopes:
      process.env.LINKEDIN_SCOPES ||
      "openid profile email w_member_social r_member_social r_member_postAnalytics r_member_profileAnalytics r_1st_connections_size",
    apiVersion: process.env.LINKEDIN_API_VERSION || "202607",
    baseUrl,
  };
}

export function getLinkedInProvider() {
  return process.env.LINKEDIN_PROVIDER === "live" ? "live" : "mock";
}
