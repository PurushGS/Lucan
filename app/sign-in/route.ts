import { signIn } from "@logto/next/server-actions";
import type { SignInOptions } from "@logto/node";
import { logtoConfig } from "@/app/logto";

const socialTargets = {
  google: "google",
  linkedin: "linkedin",
} as const;

type SocialProvider = keyof typeof socialTargets;

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider");
  const firstScreen = url.searchParams.get("screen") === "reset-password" ? "reset_password" : "sign_in";
  const options: SignInOptions = {
    redirectUri: `${logtoConfig.baseUrl}/callback`,
    postRedirectUri: logtoConfig.baseUrl,
    firstScreen,
  };

  if (isSocialProvider(provider)) {
    options.directSignIn = {
      method: "social",
      target: socialTargets[provider],
    };
  }

  await signIn(logtoConfig, options);
};

function isSocialProvider(provider: string | null): provider is SocialProvider {
  return provider === "google" || provider === "linkedin";
}
