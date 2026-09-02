export class LinkedInSetupError extends Error {
  constructor(message = "LinkedIn OAuth is not configured yet. Add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET.") {
    super(message);
    this.name = "LinkedInSetupError";
  }
}

export type LinkedInConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string;
  apiVersion: string;
};

export function isLinkedInConfigured() {
  return Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
}

export function getLinkedInConfig(): LinkedInConfig {
  if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET) {
    throw new LinkedInSetupError();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    redirectUri: process.env.LINKEDIN_REDIRECT_URI || `${baseUrl}/api/linkedin/callback`,
    scopes:
      process.env.LINKEDIN_SCOPES ||
      "openid profile email w_member_social r_member_social r_member_postAnalytics r_member_profileAnalytics r_1st_connections_size",
    apiVersion: process.env.LINKEDIN_API_VERSION || "202607",
  };
}
