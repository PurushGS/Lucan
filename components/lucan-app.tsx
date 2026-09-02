"use client";

import {
  BarChart3,
  Database,
  FileText,
  LayoutDashboard,
  Link2,
  LogOut,
  PenLine,
  Save,
  Sparkles,
  UserRound,
  Youtube,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AppUser, ContentDnaProfile, Draft, SourceType } from "@/src/types/lucan";

type View = "dashboard" | "generator" | "drafts" | "analytics" | "dna" | "settings";

type GenerateResponse = {
  generationId: string;
  title: string;
  post: string;
  notes: string[];
  sourceExcerpt: string;
};

type AnalyticsResponse = {
  drafts: number;
  generations: number;
  hasDna: boolean;
  sourceMix: Array<{ sourceType: string; count: number }>;
};

const navItems: Array<{ id: View; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "generator", label: "Post Generator", icon: PenLine },
  { id: "drafts", label: "Drafts", icon: FileText },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "dna", label: "Content DNA", icon: Sparkles },
  { id: "settings", label: "Settings", icon: UserRound },
];

const sourceOptions: Array<{ id: SourceType; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { id: "topic", label: "Topic", icon: Sparkles },
  { id: "article", label: "Article", icon: Link2 },
  { id: "pdf", label: "PDF", icon: FileText },
  { id: "youtube", label: "YouTube", icon: Youtube },
];

export function LucanApp({ user }: { user: AppUser }) {
  const [view, setView] = useState<View>("dashboard");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [dna, setDna] = useState<ContentDnaProfile | null>(null);

  const refresh = useCallback(async () => {
    const [draftResponse, analyticsResponse, dnaResponse] = await Promise.all([
      fetch("/api/drafts"),
      fetch("/api/analytics"),
      fetch("/api/dna"),
    ]);

    if (draftResponse.ok) {
      const data = (await draftResponse.json()) as { drafts: Draft[] };
      setDrafts(data.drafts);
    }

    if (analyticsResponse.ok) {
      const data = (await analyticsResponse.json()) as { analytics: AnalyticsResponse };
      setAnalytics(data.analytics);
    }

    if (dnaResponse.ok) {
      const data = (await dnaResponse.json()) as { profile: ContentDnaProfile | null };
      setDna(data.profile);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const title = navItems.find((item) => item.id === view)?.label ?? "Lucan";

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <span className="brand-mark">L</span>
          <span>Lucan</span>
        </div>
        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={`nav-button ${view === item.id ? "active" : ""}`}
                key={item.id}
                onClick={() => setView(item.id)}
                type="button"
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <strong>{user.name || user.email || "Lucan user"}</strong>
          <span style={{ display: "block", marginTop: 4 }}>Local workspace</span>
        </div>
      </aside>

      <section className="main">
        <header className="topbar">
          <div>
            <h1>{title}</h1>
            <p>{view === "settings" ? "Account and integrations" : "Write, save, and learn from your content."}</p>
          </div>
          <div className="actions">
            <button className="secondary-button" onClick={() => setView("generator")} type="button">
              New draft
            </button>
            <a className="ghost-button" href="/sign-out" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <LogOut size={16} />
              Sign out
            </a>
          </div>
        </header>

        {view === "dashboard" && <Dashboard analytics={analytics} drafts={drafts} dna={dna} setView={setView} />}
        {view === "generator" && <Generator dna={dna} onSaved={refresh} />}
        {view === "drafts" && <Drafts drafts={drafts} />}
        {view === "analytics" && <Analytics analytics={analytics} />}
        {view === "dna" && <ContentDna dna={dna} onUpdated={refresh} />}
        {view === "settings" && <Settings user={user} />}
      </section>
    </main>
  );
}

function Dashboard({
  analytics,
  drafts,
  dna,
  setView,
}: {
  analytics: AnalyticsResponse | null;
  drafts: Draft[];
  dna: ContentDnaProfile | null;
  setView: (view: View) => void;
}) {
  return (
    <>
      <div className="dashboard-grid">
        <Metric label="Drafts" value={analytics?.drafts ?? 0} />
        <Metric label="Generations" value={analytics?.generations ?? 0} />
        <Metric label="Content DNA" value={analytics?.hasDna ? "Ready" : "Pending"} />
        <Metric label="Sources" value={analytics?.sourceMix.length ?? 0} />
      </div>
      <div className="workspace-grid">
        <section className="panel section">
          <h2>Recent drafts</h2>
          <DraftList drafts={drafts.slice(0, 4)} empty="No drafts saved yet." />
        </section>
        <section className="panel section">
          <h2>Today</h2>
          <div className="input-grid">
            <button className="primary-button" onClick={() => setView("generator")} type="button">
              Generate post
            </button>
            <button className="secondary-button" onClick={() => setView("dna")} type="button">
              {dna ? "View Content DNA" : "Build Content DNA"}
            </button>
            <p className="fine-print">LinkedIn publishing and profile analytics will appear after the LinkedIn OAuth slice is connected.</p>
          </div>
        </section>
      </div>
    </>
  );
}

function Generator({ dna, onSaved }: { dna: ContentDnaProfile | null; onSaved: () => Promise<void> }) {
  const [sourceType, setSourceType] = useState<SourceType>("topic");
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const inputLabel = sourceType === "topic" ? "Topic" : sourceType === "youtube" ? "YouTube URL" : "Article URL";

  async function generate() {
    setBusy(true);
    setError("");
    setStatus("Generating...");
    setResult(null);

    const body = new FormData();
    body.set("sourceType", sourceType);
    body.set("input", input);
    if (file) body.set("file", file);

    const response = await fetch("/api/generate", { method: "POST", body });
    const payload = await readPayload(response);

    if (!response.ok) {
      setError(payload.error?.message ?? "Generation failed.");
      setStatus("");
      setBusy(false);
      return;
    }

    setResult(payload as GenerateResponse);
    setStatus("Generated");
    setBusy(false);
  }

  async function saveDraft() {
    if (!result) return;
    setBusy(true);
    setError("");

    const response = await fetch("/api/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceType,
        sourceValue: sourceType === "pdf" ? file?.name ?? "Uploaded PDF" : input,
        title: result.title,
        content: result.post,
      }),
    });
    const payload = await readPayload(response);

    if (!response.ok) {
      setError(payload.error?.message ?? "Draft save failed.");
    } else {
      setStatus("Saved to drafts");
      await onSaved();
    }
    setBusy(false);
  }

  return (
    <div className="workspace-grid">
      <section className="panel section">
        <h2>Source</h2>
        <div className="input-grid">
          <div className="segmented">
            {sourceOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  className={`segment ${sourceType === option.id ? "active" : ""}`}
                  key={option.id}
                  onClick={() => setSourceType(option.id)}
                  type="button"
                >
                  <Icon size={16} /> {option.label}
                </button>
              );
            })}
          </div>

          {sourceType === "pdf" ? (
            <label className="field">
              <span>PDF</span>
              <input accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} type="file" />
            </label>
          ) : (
            <label className="field">
              <span>{inputLabel}</span>
              <textarea
                onChange={(event) => setInput(event.target.value)}
                rows={sourceType === "topic" ? 7 : 3}
                value={input}
              />
            </label>
          )}

          <div className="actions">
            <button className="primary-button" disabled={busy} onClick={generate} type="button">
              {busy ? "Working..." : "Generate"}
            </button>
            <span className="fine-print">{dna ? "DNA active" : "DNA not saved yet"}</span>
          </div>
          {status && <div className="status">{status}</div>}
          {error && <div className="status error">{error}</div>}
        </div>
      </section>

      <section className="panel section result-box">
        <h2>Draft</h2>
        <div className="post-output">{result?.post ?? "Your generated post will appear here."}</div>
        {result?.notes?.length ? <p className="fine-print" style={{ marginTop: 12 }}>{result.notes.join(" ")}</p> : null}
        <div className="actions" style={{ marginTop: 14 }}>
          <button className="secondary-button" disabled={!result || busy} onClick={saveDraft} type="button">
            <Save size={16} /> Save draft
          </button>
        </div>
      </section>
    </div>
  );
}

function Drafts({ drafts }: { drafts: Draft[] }) {
  return (
    <section className="panel section">
      <h2>Draft board</h2>
      <DraftList drafts={drafts} empty="No drafts yet." />
    </section>
  );
}

function Analytics({ analytics }: { analytics: AnalyticsResponse | null }) {
  const max = useMemo(() => Math.max(1, ...(analytics?.sourceMix.map((item) => item.count) ?? [1])), [analytics]);

  return (
    <div className="workspace-grid">
      <section className="panel section">
        <h2>Workspace analytics</h2>
        <div className="dashboard-grid">
          <Metric label="Drafts" value={analytics?.drafts ?? 0} />
          <Metric label="Generated" value={analytics?.generations ?? 0} />
          <Metric label="DNA" value={analytics?.hasDna ? "Ready" : "Pending"} />
          <Metric label="LinkedIn" value="Later" />
        </div>
      </section>
      <section className="panel section">
        <h2>Source mix</h2>
        <div className="chart-bars">
          {(analytics?.sourceMix.length ? analytics.sourceMix : [{ sourceType: "none", count: 0 }]).map((item) => (
            <div
              aria-label={`${item.sourceType}: ${item.count}`}
              className="bar"
              key={item.sourceType}
              style={{ height: `${Math.max(8, (item.count / max) * 100)}%` }}
              title={`${item.sourceType}: ${item.count}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function ContentDna({ dna, onUpdated }: { dna: ContentDnaProfile | null; onUpdated: () => Promise<void> }) {
  const [posts, setPosts] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function buildDna() {
    setBusy(true);
    setError("");
    setStatus("Analyzing...");
    const response = await fetch("/api/dna", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ posts }),
    });
    const payload = await readPayload(response);

    if (!response.ok) {
      setError(payload.error?.message ?? "Content DNA failed.");
      setStatus("");
    } else {
      setStatus("Content DNA saved");
      await onUpdated();
    }
    setBusy(false);
  }

  return (
    <div className="workspace-grid">
      <section className="panel section">
        <h2>Content DNA</h2>
        {dna ? (
          <div className="dna-grid">
            <DnaCard title="Identity Core" text={dna.identityCore} />
            <DnaCard title="Voice Signature" text={dna.voiceSignature} />
            <DnaCard title="Content Pillars" text={dna.contentPillars.join(", ")} />
            <DnaCard title="Positioning" text={dna.positioningLayer} />
            <DnaCard title="Audience Field" text={dna.audienceField} />
          </div>
        ) : (
          <div className="status">No Content DNA saved.</div>
        )}
      </section>

      <section className="panel section">
        <h2>Build from posts</h2>
        <label className="field">
          <span>LinkedIn post history</span>
          <textarea onChange={(event) => setPosts(event.target.value)} rows={12} value={posts} />
        </label>
        <button className="primary-button" disabled={busy} onClick={buildDna} type="button">
          {busy ? "Working..." : "Generate DNA"}
        </button>
        {status && <div className="status" style={{ marginTop: 12 }}>{status}</div>}
        {error && <div className="status error" style={{ marginTop: 12 }}>{error}</div>}
      </section>
    </div>
  );
}

function Settings({ user }: { user: AppUser }) {
  return (
    <div className="workspace-grid">
      <section className="panel section">
        <h2>Profile</h2>
        <p className="fine-print">{user.name || user.email}</p>
      </section>
      <section className="panel section">
        <h2>LinkedIn</h2>
        <div className="status">Not connected</div>
        <p className="fine-print" style={{ marginTop: 12 }}>
          OAuth posting and LinkedIn analytics are queued for the next integration slice.
        </p>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="panel metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DnaCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="dna-card">
      <strong>{title}</strong>
      <p>{text}</p>
    </article>
  );
}

function DraftList({ drafts, empty }: { drafts: Draft[]; empty: string }) {
  if (!drafts.length) return <div className="status">{empty}</div>;

  return (
    <div className="draft-list">
      {drafts.map((draft) => (
        <article className="draft-card" key={draft.id}>
          <header>
            <span>{draft.title}</span>
            <span>{draft.sourceType}</span>
          </header>
          <p>{draft.content}</p>
        </article>
      ))}
    </div>
  );
}

async function readPayload(response: Response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { error: { message: text } };
  }
}
