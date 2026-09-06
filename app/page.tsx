import { getLogtoContext } from "@logto/next/server-actions";
import Image from "next/image";
import Link from "next/link";
import { LucanApp } from "@/components/lucan-app";
import { logtoConfig } from "@/app/logto";
import { isRecoverableAuthError } from "@/src/lib/auth/errors";
import { ensureUser } from "@/src/lib/db/users";
import { getUserFacingError } from "@/src/lib/friendly-errors";
import type { AppNotice, AuthAccountLinks } from "@/components/lucan-app";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ account?: string; linkedin?: string; message?: string; show_success?: string; view?: string }>;
}) {
  const context = await getSafeLogtoContext();

  if (!context.isAuthenticated) {
    return <Unauthenticated notice={context.expired ? "Your session expired. Sign in again." : undefined} />;
  }

  const user = await ensureUser(context);
  const params = await searchParams;
  const initialNotice: AppNotice | null = params?.account === "updated" || params?.show_success
    ? {
        kind: "success",
        message: getAccountSuccessMessage(params?.show_success),
      }
    : params?.message
      ? {
          kind: params.linkedin === "connected" ? "success" : "error",
          message: getUserFacingError(
            { error: { message: params.message } },
            params.linkedin === "connected"
              ? "LinkedIn connected."
              : params.linkedin
                ? "LinkedIn could not finish connecting. Please try again."
                : "Something went wrong. Please try again.",
          ),
        }
      : null;
  const initialView = params?.view === "settings" ? "settings" : "dashboard";

  return (
    <LucanApp
      accountLinks={buildAccountLinks()}
      initialNotice={initialNotice}
      initialView={initialView}
      user={user}
    />
  );
}

async function getSafeLogtoContext() {
  try {
    const context = await getLogtoContext(logtoConfig, { fetchUserInfo: true });
    return { ...context, expired: false };
  } catch (error) {
    if (isRecoverableAuthError(error)) {
      return { isAuthenticated: false, expired: true };
    }
    throw error;
  }
}

function buildAccountLinks(): AuthAccountLinks {
  return {
    password: "/forgot-password",
  };
}

function getAccountSuccessMessage(successType: string | undefined) {
  if (successType === "email") return "Email updated.";
  if (successType === "password") return "Password updated.";
  if (successType === "profile") return "Profile updated.";
  return "Account settings updated.";
}

function Unauthenticated({ notice }: { notice?: string }) {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="brand-row">
          <Image alt="" className="brand-logo" height={36} priority src="/brand/reachcraft-mark.svg" width={36} />
          <span>Reachcraft</span>
        </div>
        <h1>Turn your inputs into sharp LinkedIn drafts.</h1>
        <p>Generate from a topic, article, PDF, or YouTube video, then save the best version into your draft board.</p>
        {notice ? <div className="status error auth-notice">{notice}</div> : null}
        <div className="auth-actions">
          <Link className="primary-button as-link" href="/sign-in">
            Continue with email
          </Link>
          <div className="auth-provider-grid">
            <Link className="secondary-button as-link" href="/sign-in?provider=google">
              Continue with Google
            </Link>
            <Link className="secondary-button as-link" href="/sign-in?provider=linkedin">
              Continue with LinkedIn
            </Link>
          </div>
          <Link className="auth-link" href="/forgot-password">
            Forgot password?
          </Link>
        </div>
      </section>
    </main>
  );
}
