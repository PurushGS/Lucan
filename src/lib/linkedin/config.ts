export const linkedInSetupMessage =
  "LinkedIn OAuth is not configured yet. Add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET, then restart the local server.";

export class LinkedInSetupError extends Error {
  constructor(message = linkedInSetupMessage) {
    super(message);
    this.name = "LinkedInSetupError";
  }
}

export type LinkedInConfig = {
  provider: "live";
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string;
  apiVersion: string;
  baseUrl: string;
};

export function isLinkedInConfigured() {
  return Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
}

export function getLinkedInConfig(): LinkedInConfig {
  if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET) {
    throw new LinkedInSetupError();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
  return {
    provider: "live",
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    redirectUri: process.env.LINKEDIN_REDIRECT_URI || `${baseUrl}/api/linkedin/callback`,
    scopes: process.env.LINKEDIN_SCOPES || "openid profile email w_member_social",
    apiVersion: process.env.LINKEDIN_API_VERSION || "202607",
    baseUrl,
  };
}

export function getLinkedInProvider() {
  return "live" as const;
}

export function getMissingLinkedInScopes(grantedScopes: string, requiredScopes: string[]) {
  const granted = new Set(grantedScopes.split(/[,\s]+/).map((scope) => scope.trim()).filter(Boolean));
  return requiredScopes.filter((scope) => !granted.has(scope));
}
