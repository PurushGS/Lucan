import { getLogtoContext } from "@logto/next/server-actions";
import { redirect } from "next/navigation";
import { LucanApp } from "@/components/lucan-app";
import { logtoConfig } from "@/app/logto";
import { ensureUser } from "@/src/lib/db/users";
import type { AppNotice } from "@/components/lucan-app";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ linkedin?: string; message?: string }>;
}) {
  const context = await getLogtoContext(logtoConfig, { fetchUserInfo: true });

  if (!context.isAuthenticated) {
    return <Unauthenticated />;
  }

  const user = await ensureUser(context);
  const params = await searchParams;
  const initialNotice: AppNotice | null = params?.message
    ? {
        kind: params.linkedin === "connected" ? "success" : "error",
        message: params.message,
      }
    : null;

  return <LucanApp initialNotice={initialNotice} user={user} />;
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
        <form
          action={async () => {
            "use server";
            redirect("/sign-in");
          }}
        >
          <button className="primary-button" type="submit">
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
