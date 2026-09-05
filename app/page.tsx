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
  const context = await getLogtoContext(logtoConfig, { fetchUserInfo: true });

  if (!context.isAuthenticated) {
    return <Unauthenticated />;
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

function buildAccountLinks(): AuthAccountLinks {
  return {
    email: buildLogtoAccountUrl("email"),
    password: buildLogtoAccountUrl("password"),
    profile: buildLogtoAccountUrl("profile"),
  };
}

function buildLogtoAccountUrl(path: "email" | "password" | "profile") {
  const url = new URL(`/account/${path}`, logtoConfig.endpoint);
  url.searchParams.set("redirect", `${logtoConfig.baseUrl}/?view=settings`);
  url.searchParams.set("show_success", "true");
  return url.toString();
}

function getAccountSuccessMessage(successType: string | undefined) {
  if (successType === "email") return "Email updated.";
  if (successType === "password") return "Password updated.";
  if (successType === "profile") return "Profile updated.";
  return "Account settings updated.";
}

function Unauthenticated() {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="brand-row">
          <span className="brand-mark">L</span>
          <span>Lucan</span>
        </div>
        <h1>Turn your inputs into sharp LinkedIn drafts.</h1>
        <p>Generate from a topic, article, PDF, or YouTube video, then save the best version into your draft board.</p>
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
