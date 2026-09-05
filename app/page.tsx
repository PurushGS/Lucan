import { getLogtoContext } from "@logto/next/server-actions";
import Link from "next/link";
import { LucanApp } from "@/components/lucan-app";
import { logtoConfig } from "@/app/logto";
import { ensureUser } from "@/src/lib/db/users";
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
          message: params.message,
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
    if (isExpiredAuthError(error)) {
      return { isAuthenticated: false, expired: true };
    }
    throw error;
  }
}

function isExpiredAuthError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    ("code" in error || "name" in error || "message" in error) &&
    ((error as { code?: unknown }).code === "ERR_JWT_EXPIRED" ||
      (error as { name?: unknown }).name === "JWTExpired" ||
      String((error as { message?: unknown }).message ?? "").includes("JWTExpired"))
  );
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
          <span className="brand-mark">L</span>
          <span>Lucan</span>
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
