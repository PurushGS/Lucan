import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MockLinkedInConsent({
  searchParams,
}: {
  searchParams?: Promise<{ state?: string }>;
}) {
  const state = (await searchParams)?.state;
  if (!state) {
    redirect("/?linkedin=error&message=Mock%20LinkedIn%20state%20is%20missing.");
  }

  const authorizeUrl = `/api/linkedin/callback?code=mock-linkedin-consent&state=${encodeURIComponent(state)}`;

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="brand-row">
          <span className="brand-mark">in</span>
          <span>LinkedIn sandbox</span>
        </div>
        <h1>Connect your LinkedIn account.</h1>
        <p>
          Lucan will import recent posts and analytics to build Content DNA. This local sandbox mimics the production
          OAuth flow without creating the final LinkedIn developer app yet.
        </p>
        <div className="mock-permissions">
          <strong>Lucan can access:</strong>
          <ul className="plain-list">
            <li>Your basic LinkedIn profile</li>
            <li>Recent LinkedIn posts for DNA</li>
            <li>Post analytics for dashboard metrics</li>
          </ul>
        </div>
        <div className="actions" style={{ marginTop: 24 }}>
          <Link className="primary-button as-link" href={authorizeUrl}>
            Authorize Lucan
          </Link>
          <Link className="ghost-button as-link" href="/?linkedin=error&message=LinkedIn%20connection%20cancelled.">
            Cancel
          </Link>
        </div>
      </section>
    </main>
  );
}
