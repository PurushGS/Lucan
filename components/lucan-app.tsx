"use client";

import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Columns3,
  FileText,
  Flame,
  LayoutDashboard,
  Link2,
  Lightbulb,
  LogOut,
  PenLine,
  Save,
  Send,
  Sparkles,
  TrendingUp,
  UserRound,
  Youtube,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  AppUser,
  ContentDnaProfile,
  ContentDnaRecord,
  Draft,
  LinkedInDashboardAnalytics,
  LinkedInImportedPost,
  LinkedInStatus,
  PostScore,
  RewriteResult,
  SourceType,
} from "@/src/types/lucan";

type View =
  | "dashboard"
  | "generator"
  | "drafts"
  | "kanban"
  | "calendar"
  | "analytics"
  | "dna"
  | "inspiration"
  | "viral"
  | "settings";

export type AppNotice = {
  kind: "success" | "error";
  message: string;
};

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
  linkedin: LinkedInDashboardAnalytics;
  sourceMix: Array<{ sourceType: string; count: number }>;
};

type PostingSlot = {
  label: string;
  detail: string;
  score: number;
  source: "linkedin" | "baseline";
};

const navGroups: Array<{
  label: string;
  items: Array<{ id: View; label: string; icon: React.ComponentType<{ size?: number }> }>;
}> = [
  {
    label: "Create",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "generator", label: "Post Generator", icon: PenLine },
      { id: "drafts", label: "Drafts", icon: FileText },
      { id: "kanban", label: "Kanban", icon: Columns3 },
      { id: "calendar", label: "Calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Learn",
    items: [
      { id: "analytics", label: "Analytics", icon: BarChart3 },
      { id: "dna", label: "Content DNA", icon: Sparkles },
      { id: "inspiration", label: "Content Inspiration", icon: Lightbulb },
      { id: "viral", label: "Viral Posts", icon: Flame },
    ],
  },
  {
    label: "Workspace",
    items: [{ id: "settings", label: "Settings", icon: UserRound }],
  },
];

const sourceOptions: Array<{ id: SourceType; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { id: "topic", label: "Topic", icon: Sparkles },
  { id: "article", label: "Article", icon: Link2 },
  { id: "pdf", label: "PDF", icon: FileText },
  { id: "youtube", label: "YouTube", icon: Youtube },
];

const toneOptions = [
  "Professional",
  "Candid",
  "Casual",
  "Convincing",
  "Engaging",
  "Informative",
  "Encouraging",
  "Passionate",
];

export type AuthAccountLinks = {
  password: string;
};

export function LucanApp({
  accountLinks,
  initialNotice,
  initialView = "dashboard",
  user,
}: {
  accountLinks: AuthAccountLinks;
  initialNotice: AppNotice | null;
  initialView?: View;
  user: AppUser;
}) {
  const [view, setView] = useState<View>(initialView);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [dna, setDna] = useState<ContentDnaProfile | null>(null);
  const [dnaRecord, setDnaRecord] = useState<ContentDnaRecord | null>(null);
  const [linkedinStatus, setLinkedInStatus] = useState<LinkedInStatus | null>(null);
  const [notice, setNotice] = useState<AppNotice | null>(initialNotice);

  const refresh = useCallback(async () => {
    const [draftResponse, analyticsResponse, dnaResponse, linkedinResponse] = await Promise.allSettled([
      fetch("/api/drafts"),
      fetch("/api/analytics"),
      fetch("/api/dna"),
      fetch("/api/linkedin/status"),
    ]);

    if (draftResponse.status === "fulfilled" && draftResponse.value.ok) {
      const data = (await draftResponse.value.json()) as { drafts: Draft[] };
      setDrafts(data.drafts);
    }

    if (analyticsResponse.status === "fulfilled" && analyticsResponse.value.ok) {
      const data = (await analyticsResponse.value.json()) as { analytics: AnalyticsResponse };
      setAnalytics(data.analytics);
    }

    if (dnaResponse.status === "fulfilled" && dnaResponse.value.ok) {
      const data = (await dnaResponse.value.json()) as { profile: ContentDnaProfile | null; dna: ContentDnaRecord | null };
      setDna(data.profile);
      setDnaRecord(data.dna);
    }

    if (linkedinResponse.status === "fulfilled" && linkedinResponse.value.ok) {
      const data = (await linkedinResponse.value.json()) as { status: LinkedInStatus };
      setLinkedInStatus(data.status);
    } else {
      setLinkedInStatus({ provider: "mock", configured: false, connected: false, account: null, dna: null });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh, view]);

  const title = navGroups.flatMap((group) => group.items).find((item) => item.id === view)?.label ?? "Lucan";

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <span className="brand-mark">L</span>
          <span>Lucan</span>
        </div>
        <nav className="side-nav" aria-label="Main navigation">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <span className="nav-group-label">{group.label}</span>
              {group.items.map((item) => {
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
            </div>
          ))}
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
            <button className="primary-button" onClick={() => setView("generator")} type="button">
              <PenLine size={16} />
              New draft
            </button>
            <a className="ghost-button" href="/sign-out" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <LogOut size={16} />
              Sign out
            </a>
          </div>
        </header>
        {notice ? (
          <div className={`status ${notice.kind === "error" ? "error" : "success"} notice`}>
            <span>{notice.message}</span>
            <button className="ghost-button" onClick={() => setNotice(null)} type="button">
              Dismiss
            </button>
          </div>
        ) : null}

        {view === "dashboard" && <Dashboard analytics={analytics} drafts={drafts} dna={dna} linkedinStatus={linkedinStatus} setView={setView} />}
        {view === "generator" && <Generator dna={dna} onSaved={refresh} />}
        {view === "drafts" && <Drafts drafts={drafts} onUpdated={refresh} />}
        {view === "kanban" && <Kanban drafts={drafts} setView={setView} />}
        {view === "calendar" && <Calendar analytics={analytics} drafts={drafts} setView={setView} />}
        {view === "analytics" && <Analytics analytics={analytics} />}
        {view === "dna" && <ContentDna dna={dna} dnaRecord={dnaRecord} linkedinStatus={linkedinStatus} onUpdated={refresh} />}
        {view === "inspiration" && <ContentInspiration analytics={analytics} setView={setView} />}
        {view === "viral" && <ViralPosts analytics={analytics} setView={setView} />}
        {view === "settings" && <Settings accountLinks={accountLinks} user={user} linkedinStatus={linkedinStatus} onUpdated={refresh} />}
      </section>
    </main>
  );
}

function Dashboard({
  analytics,
  drafts,
  dna,
  linkedinStatus,
  setView,
}: {
  analytics: AnalyticsResponse | null;
  drafts: Draft[];
  dna: ContentDnaProfile | null;
  linkedinStatus: LinkedInStatus | null;
  setView: (view: View) => void;
}) {
  const linkedin = analytics?.linkedin;
  const scheduledCount = drafts.filter((draft) => draft.status === "scheduled").length;
  const publishedCount = drafts.filter((draft) => draft.status === "published").length;
  const bestSlots = getBestPostingSlots(linkedin);

  return (
    <>
      <div className="dashboard-grid metric-strip">
        <Metric label="Drafts" value={analytics?.drafts ?? 0} />
        <Metric label="Scheduled" value={scheduledCount} />
        <Metric label="Published" value={publishedCount} />
        <Metric label="Content DNA" value={analytics?.hasDna ? "Ready" : "Pending"} />
        <Metric label="LinkedIn posts" value={linkedin?.account?.postsImported ?? 0} />
        <Metric label="Impressions" value={formatNumber(linkedin?.totals.impressions ?? 0)} />
      </div>
      <div className="dashboard-layout">
        <section className="panel section">
          <div className="section-heading-row">
            <h2>Recent drafts</h2>
            <button className="ghost-button" onClick={() => setView("drafts")} type="button">
              Open drafts
            </button>
          </div>
          <CompactDraftGrid drafts={drafts.slice(0, 4)} empty="No drafts saved yet." />
        </section>
        <section className="panel section">
          <div className="section-heading-row">
            <h2>Best time to post</h2>
            <Clock3 size={18} />
          </div>
          <BestTimeList slots={bestSlots} />
          <button className="secondary-button full-width-action" onClick={() => setView("calendar")} type="button">
            <CalendarDays size={16} />
            Open calendar
          </button>
        </section>
        <section className="panel section">
          <h2>Today</h2>
          <div className="input-grid">
            <button className="primary-button" onClick={() => setView("generator")} type="button">
              <PenLine size={16} />
              Generate post
            </button>
            <button className="secondary-button" onClick={() => setView("dna")} type="button">
              <Sparkles size={16} />
              {dna ? "View Content DNA" : "Connect LinkedIn"}
            </button>
            <button className="secondary-button" onClick={() => setView("calendar")} type="button">
              <CalendarDays size={16} />
              Calendar
            </button>
            <button className="secondary-button" onClick={() => setView("kanban")} type="button">
              <Columns3 size={16} />
              Kanban
            </button>
            <p className="fine-print">
              {linkedinStatus?.connected
                ? "Sync LinkedIn posts to keep Content DNA current."
                : "Content DNA starts after the user connects a LinkedIn account."}
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

function Generator({ dna, onSaved }: { dna: ContentDnaProfile | null; onSaved: () => Promise<void> }) {
  const [sourceType, setSourceType] = useState<SourceType>("topic");
  const [input, setInput] = useState("");
  const [tone, setTone] = useState("");
  const [instructions, setInstructions] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [draftContent, setDraftContent] = useState("");
  const [score, setScore] = useState<PostScore | null>(null);
  const [scoreModel, setScoreModel] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [rewriting, setRewriting] = useState(false);

  const inputLabel = sourceType === "topic" ? "Topic" : sourceType === "youtube" ? "YouTube URL" : "Article URL";

  async function generate() {
    setBusy(true);
    setError("");
    setStatus("Generating...");
    setResult(null);

    const body = new FormData();
    body.set("sourceType", sourceType);
    body.set("input", input);
    body.set("tone", tone);
    body.set("instructions", instructions);
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
    setDraftContent((payload as GenerateResponse).post);
    setScore(null);
    setScoreModel("");
    setStatus("Generated");
    setBusy(false);
  }

  async function saveDraft() {
    if (!result || !draftContent.trim()) return;
    setBusy(true);
    setError("");

    const response = await fetch("/api/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceType,
        sourceValue: sourceType === "pdf" ? file?.name ?? "Uploaded PDF" : input,
        title: result.title,
        content: draftContent,
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

  async function checkScore() {
    if (!draftContent.trim()) return;
    setScoring(true);
    setError("");
    const response = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post: draftContent }),
    });
    const payload = await readPayload(response);
    if (!response.ok) {
      setError(payload.error?.message ?? "Score check failed.");
    } else {
      const data = payload as { score: PostScore; model?: string };
      setScore(data.score);
      setScoreModel(data.model ?? "");
    }
    setScoring(false);
  }

  async function rewriteWithScore() {
    if (!draftContent.trim() || !score) return;
    setRewriting(true);
    setError("");
    setStatus("Improving draft...");
    const response = await fetch("/api/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post: draftContent, score }),
    });
    const payload = await readPayload(response);
    if (!response.ok) {
      setError(payload.error?.message ?? "Rewrite failed.");
      setStatus("");
    } else {
      const rewrite = payload as RewriteResult;
      setDraftContent(rewrite.post);
      setResult((current) => (current ? { ...current, post: rewrite.post, notes: rewrite.changes } : current));
      setScore(null);
      setScoreModel("");
      setStatus("Improved draft. Review and save when ready.");
    }
    setRewriting(false);
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

          <label className="field">
            <span>Tone of voice</span>
            <select value={tone} onChange={(event) => setTone(event.target.value)}>
              <option value="">Auto</option>
              {toneOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Instructions</span>
            <textarea
              onChange={(event) => setInstructions(event.target.value)}
              placeholder="Focus on a specific angle, audience, or part of the source."
              rows={3}
              value={instructions}
            />
          </label>

          <div className="actions">
            <button className="primary-button" disabled={busy} onClick={generate} type="button">
              <Sparkles size={16} />
              {busy ? "Working..." : "Generate"}
            </button>
            <span className="fine-print">{dna ? "LinkedIn DNA active" : "Connect LinkedIn to activate DNA"}</span>
          </div>
          {status && <div className="status">{status}</div>}
          {error && <div className="status error">{error}</div>}
        </div>
      </section>

      <section className="panel section result-box">
        <h2>Draft</h2>
        {result ? (
          <label className="field">
            <span>{draftContent.length} characters</span>
            <textarea className="post-editor" onChange={(event) => setDraftContent(event.target.value)} rows={16} value={draftContent} />
          </label>
        ) : (
          <div className="post-output">Your generated post will appear here.</div>
        )}
        {result?.notes?.length ? <p className="fine-print" style={{ marginTop: 12 }}>{result.notes.join(" ")}</p> : null}
        <div className="actions" style={{ marginTop: 14 }}>
          <button className="secondary-button" disabled={!result || busy} onClick={saveDraft} type="button">
            <Save size={16} /> Save draft
          </button>
          <button className="secondary-button" disabled={!draftContent || scoring} onClick={checkScore} type="button">
            <CheckCircle2 size={16} /> {scoring ? "Checking..." : "Check score"}
          </button>
          <button className="secondary-button" disabled={!score || rewriting} onClick={rewriteWithScore} type="button">
            <Sparkles size={16} /> {rewriting ? "Improving..." : "Improve with score"}
          </button>
        </div>
        {score ? <ScorePanel model={scoreModel} score={score} /> : null}
      </section>
    </div>
  );
}

function Drafts({ drafts, onUpdated }: { drafts: Draft[]; onUpdated: () => Promise<void> }) {
  const [selectedId, setSelectedId] = useState<string | null>(drafts[0]?.id ?? null);
  const selected = drafts.find((draft) => draft.id === selectedId) ?? drafts[0] ?? null;

  useEffect(() => {
    if (!selectedId && drafts[0]) setSelectedId(drafts[0].id);
  }, [drafts, selectedId]);

  return (
    <div className="workspace-grid">
      <section className="panel section">
        <h2>Draft board</h2>
        <DraftList drafts={drafts} empty="No drafts yet." onSelect={setSelectedId} selectedId={selected?.id ?? null} />
      </section>
      <section className="panel section">
        <h2>Editor</h2>
        {selected ? <DraftEditor draft={selected} onUpdated={onUpdated} /> : <div className="status">Select or create a draft first.</div>}
      </section>
    </div>
  );
}

function Kanban({ drafts, setView }: { drafts: Draft[]; setView: (view: View) => void }) {
  const columns: Array<{ status: Draft["status"]; label: string; helper: string }> = [
    { status: "draft", label: "Draft", helper: "Ideas being written" },
    { status: "scheduled", label: "Scheduled", helper: "Ready for publishing" },
    { status: "published", label: "Published", helper: "Live or marked complete" },
  ];

  return (
    <section className="panel section">
      <div className="section-heading-row">
        <div>
          <h2>Kanban board</h2>
          <p className="fine-print">Status-grouped drafts. Publishing and scheduling still happen from the editor.</p>
        </div>
        <button className="primary-button" onClick={() => setView("generator")} type="button">
          <PenLine size={16} />
          New draft
        </button>
      </div>
      <div className="kanban-board">
        {columns.map((column) => {
          const columnDrafts = drafts.filter((draft) => draft.status === column.status);
          return (
            <section className="kanban-column" key={column.status}>
              <header>
                <div>
                  <strong>{column.label}</strong>
                  <p className="fine-print">{column.helper}</p>
                </div>
                <span className={`badge ${column.status}`}>{columnDrafts.length}</span>
              </header>
              <div className="kanban-cards">
                {columnDrafts.length ? (
                  columnDrafts.map((draft) => <CompactDraftCard draft={draft} key={draft.id} />)
                ) : (
                  <div className="empty-state">No {column.label.toLowerCase()} posts yet.</div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function Calendar({
  analytics,
  drafts,
  setView,
}: {
  analytics: AnalyticsResponse | null;
  drafts: Draft[];
  setView: (view: View) => void;
}) {
  const scheduled = drafts
    .filter((draft) => draft.scheduledAt || draft.publishedAt)
    .sort((a, b) => {
      const left = a.scheduledAt ?? a.publishedAt ?? a.createdAt;
      const right = b.scheduledAt ?? b.publishedAt ?? b.createdAt;
      return new Date(left).getTime() - new Date(right).getTime();
    });
  const bestSlots = getBestPostingSlots(analytics?.linkedin);

  return (
    <div className="workspace-grid calendar-workspace">
      <section className="panel section">
        <div className="section-heading-row">
          <div>
            <h2>Best time to post</h2>
            <p className="fine-print">Calculated from imported LinkedIn history when available.</p>
          </div>
          <Clock3 size={18} />
        </div>
        <BestTimeList slots={bestSlots} />
      </section>
      <section className="panel section">
        <div className="section-heading-row">
          <h2>Scheduled content</h2>
          <button className="secondary-button" onClick={() => setView("drafts")} type="button">
            Open drafts
          </button>
        </div>
        {scheduled.length ? (
          <div className="calendar-list">
            {scheduled.map((draft) => (
              <article className="calendar-row" key={draft.id}>
                <div>
                  <strong>{draft.title}</strong>
                  <p className="fine-print">{shorten(draft.content, 180)}</p>
                </div>
                <div>
                  <span className={`badge ${draft.status}`}>{draft.status}</span>
                  <p className="fine-print" style={{ marginTop: 8 }}>
                    {formatDraftDate(draft.scheduledAt ?? draft.publishedAt)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="status">No scheduled or published posts yet.</div>
        )}
      </section>
    </div>
  );
}

function ContentInspiration({ analytics, setView }: { analytics: AnalyticsResponse | null; setView: (view: View) => void }) {
  const posts = getTopLinkedInPosts(analytics?.linkedin, 6);

  return (
    <section className="panel section">
      <div className="section-heading-row">
        <div>
          <h2>Content inspiration</h2>
          <p className="fine-print">Angles and hooks pulled from your imported LinkedIn posts.</p>
        </div>
        <button className="primary-button" onClick={() => setView("generator")} type="button">
          <Sparkles size={16} />
          Generate from idea
        </button>
      </div>
      {posts.length ? (
        <div className="inspiration-grid">
          {posts.map((post) => (
            <article className="insight-card" key={post.urn}>
              <span className="insight-label">Imported post</span>
              <h3>{deriveInspirationAngle(post.commentary)}</h3>
              <p>{shorten(post.commentary, 260)}</p>
              <div className="draft-meta">
                <span>{post.publishedAt ? formatShortDate(post.publishedAt) : "No date"}</span>
                <span>{formatNumber(getPostImpact(post))} impact</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <RealDataEmptyState
          actionLabel="Open Content DNA"
          message="Sync LinkedIn posts to turn your actual content history into inspiration cards."
          onAction={() => setView("dna")}
          title="No imported posts yet"
        />
      )}
    </section>
  );
}

function ViralPosts({ analytics, setView }: { analytics: AnalyticsResponse | null; setView: (view: View) => void }) {
  const posts = getTopLinkedInPosts(analytics?.linkedin, 10);

  return (
    <section className="panel section">
      <div className="section-heading-row">
        <div>
          <h2>Viral posts</h2>
          <p className="fine-print">Ranked from real imported post reach and engagement.</p>
        </div>
        <TrendingUp size={18} />
      </div>
      {posts.length ? (
        <div className="viral-list">
          {posts.map((post, index) => (
            <article className="viral-row" key={post.urn}>
              <strong>#{index + 1}</strong>
              <div>
                <p>{shorten(post.commentary, 260)}</p>
                <div className="draft-meta">
                  <span>{post.publishedAt ? formatShortDate(post.publishedAt) : "No date"}</span>
                  <span>{formatNumber(post.analytics.impressions)} impressions</span>
                  <span>{formatNumber(post.analytics.reactions + post.analytics.comments + post.analytics.reshares)} engagement</span>
                  {!analytics?.linkedin.analyticsAvailable ? <span>analytics permission partial</span> : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <RealDataEmptyState
          actionLabel="Sync LinkedIn"
          message="Viral ranking needs your imported LinkedIn posts. No sample posts are shown here."
          onAction={() => setView("dna")}
          title="No real post history yet"
        />
      )}
    </section>
  );
}

function Analytics({ analytics }: { analytics: AnalyticsResponse | null }) {
  const max = useMemo(() => Math.max(1, ...(analytics?.sourceMix.map((item) => item.count) ?? [1])), [analytics]);
  const linkedin = analytics?.linkedin;
  const engagement =
    (linkedin?.totals.reactions ?? 0) + (linkedin?.totals.comments ?? 0) + (linkedin?.totals.reshares ?? 0);

  return (
    <div className="workspace-grid">
      <section className="panel section analytics-wide">
        <h2>LinkedIn analytics</h2>
        <div className="dashboard-grid">
          <Metric label="Posts imported" value={linkedin?.account?.postsImported ?? 0} />
          <Metric label="Followers" value={formatOptionalNumber(linkedin?.followerCount)} />
          <Metric label="Connections" value={formatOptionalNumber(linkedin?.connectionCount)} />
          <Metric label="Engagement" value={formatNumber(engagement)} />
        </div>
        {!linkedin?.connected ? (
          <div className="status" style={{ marginTop: 14 }}>Connect LinkedIn to import real posts and analytics.</div>
        ) : !linkedin.posts.length ? (
          <div className="status" style={{ marginTop: 14 }}>LinkedIn is connected. Run sync to import posts.</div>
        ) : !linkedin.analyticsAvailable ? (
          <div className="status" style={{ marginTop: 14 }}>
            Posts are imported. Post analytics will appear after LinkedIn grants r_member_postAnalytics to this app.
          </div>
        ) : null}
        {linkedin?.posts.length ? <LinkedInPostTable posts={linkedin.posts} /> : null}
      </section>
      <section className="panel section">
        <h2>Workspace analytics</h2>
        <div className="dashboard-grid">
          <Metric label="Drafts" value={analytics?.drafts ?? 0} />
          <Metric label="Generated" value={analytics?.generations ?? 0} />
          <Metric label="DNA" value={analytics?.hasDna ? "Ready" : "Pending"} />
          <Metric label="LinkedIn" value={linkedin?.connected ? "Connected" : "Pending"} />
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

function LinkedInPostTable({ posts }: { posts: NonNullable<AnalyticsResponse["linkedin"]>["posts"] }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Post</th>
            <th>Date</th>
            <th>Impressions</th>
            <th>Reach</th>
            <th>Reactions</th>
            <th>Comments</th>
            <th>Reposts</th>
            <th>Saves</th>
            <th>Clicks</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.urn}>
              <td>{shorten(post.commentary, 120)}</td>
              <td>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "-"}</td>
              <td>{formatNumber(post.analytics.impressions)}</td>
              <td>{formatNumber(post.analytics.membersReached)}</td>
              <td>{formatNumber(post.analytics.reactions)}</td>
              <td>{formatNumber(post.analytics.comments)}</td>
              <td>{formatNumber(post.analytics.reshares)}</td>
              <td>{formatNumber(post.analytics.saves)}</td>
              <td>{formatNumber(post.analytics.linkClicks)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContentDna({
  dna,
  dnaRecord,
  linkedinStatus,
  onUpdated,
}: {
  dna: ContentDnaProfile | null;
  dnaRecord: ContentDnaRecord | null;
  linkedinStatus: LinkedInStatus | null;
  onUpdated: () => Promise<void>;
}) {
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function syncDna() {
    setBusy(true);
    setError("");
    setStatus("Importing LinkedIn posts...");
    const response = await fetch("/api/linkedin/sync", { method: "POST" });
    const payload = await readPayload(response);

    if (!response.ok) {
      setError(payload.error?.message ?? "Content DNA failed.");
      setStatus("");
    } else {
      setStatus(
        typeof payload.analyticsError === "string"
          ? `Content DNA saved. ${payload.analyticsError}`
          : "Content DNA saved with LinkedIn analytics.",
      );
      await onUpdated();
    }
    setBusy(false);
  }

  return (
    <div className="workspace-grid">
      <section className="panel section">
        <h2>Content DNA</h2>
        {dnaRecord ? (
          <div className="dashboard-grid dna-stats">
            <Metric label="Posts analyzed" value={dnaRecord.postsAnalyzed} />
            <Metric label="Median words" value={dnaRecord.medianWords} />
            <Metric label="Topics" value={dna?.contentPillars.length ?? 0} />
            <Metric label="Status" value="Ready" />
          </div>
        ) : null}
        {dna ? (
          <div className="dna-grid">
            <DnaCard title="Identity Core" text={dna.identityCore} />
            <DnaCard title="Voice Signature" text={dna.voiceSignature} />
            <DnaCard title="Content Pillars" text={dna.contentPillars.join(", ")} />
            <DnaCard title="Positioning" text={dna.positioningLayer} />
            <DnaCard title="Audience Field" text={dna.audienceField} />
          </div>
        ) : (
          <div className="status">No LinkedIn-based Content DNA yet.</div>
        )}
      </section>

      <section className="panel section">
        <h2>LinkedIn account</h2>
        <LinkedInConnection status={linkedinStatus} />
        <div className="actions" style={{ marginTop: 14 }}>
          {!linkedinStatus?.connected ? (
            <a className="primary-button as-link" href="/api/linkedin/connect">
              Connect LinkedIn
            </a>
          ) : null}
          <button className="secondary-button" disabled={!linkedinStatus?.connected || busy} onClick={syncDna} type="button">
            {busy ? "Syncing..." : "Sync posts and rebuild DNA"}
          </button>
        </div>
        {status && <div className="status" style={{ marginTop: 12 }}>{status}</div>}
        {error && <div className="status error" style={{ marginTop: 12 }}>{error}</div>}
      </section>
    </div>
  );
}

function Settings({
  accountLinks,
  user,
  linkedinStatus,
  onUpdated,
}: {
  accountLinks: AuthAccountLinks;
  user: AppUser;
  linkedinStatus: LinkedInStatus | null;
  onUpdated: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  async function sync() {
    setBusy(true);
    setError("");
    setStatus("");
    const response = await fetch("/api/linkedin/sync", { method: "POST" });
    const payload = await readPayload(response);
    if (!response.ok) {
      setError(payload.error?.message ?? "LinkedIn sync failed.");
    } else {
      setStatus(
        typeof payload.analyticsError === "string"
          ? `Content DNA synced. ${payload.analyticsError}`
          : "Content DNA and LinkedIn analytics synced.",
      );
      await onUpdated();
    }
    setBusy(false);
  }

  return (
    <div className="workspace-grid">
      <section className="panel section">
        <div className="section-heading-row">
          <h2>Profile and login</h2>
        </div>
        <div className="account-profile">
          <span
            aria-label="Profile picture"
            className="profile-avatar"
            style={user.picture ? { backgroundImage: `url("${user.picture}")` } : undefined}
          >
            {user.picture ? null : getInitials(user)}
          </span>
          <div>
            <strong>{user.name || "Not set"}</strong>
            <p className="fine-print">{user.email || "No email stored"}</p>
          </div>
        </div>
        <div className="settings-list">
          <AccountDetail label="User ID" value={user.id} />
          <AccountDetail label="Display name" value={user.name || "Not set"} />
          <AccountDetail label="Email" value={user.email || "Not set"} />
          <AccountDetail label="Profile image" value={user.picture || "Not set"} />
        </div>
      </section>
      <section className="panel section">
        <h2>Security</h2>
        <div className="settings-list">
          <AccountDetail label="Identity provider" value="Logto" />
          <AccountDetail label="Password" value="Managed by Logto" />
        </div>
        <div className="actions" style={{ marginTop: 14 }}>
          <a className="primary-button as-link" href={accountLinks.password}>
            Change password
          </a>
        </div>
      </section>
      <section className="panel section">
        <h2>LinkedIn</h2>
        <LinkedInConnection status={linkedinStatus} />
        <div className="actions" style={{ marginTop: 14 }}>
          {!linkedinStatus?.connected ? (
            <a className="primary-button as-link" href="/api/linkedin/connect">
              Connect LinkedIn
            </a>
          ) : null}
          <button className="secondary-button" disabled={!linkedinStatus?.connected || busy} onClick={sync} type="button">
            {busy ? "Syncing..." : "Sync Content DNA"}
          </button>
        </div>
        {status && <div className="status" style={{ marginTop: 12 }}>{status}</div>}
        {error && <div className="status error" style={{ marginTop: 12 }}>{error}</div>}
      </section>
    </div>
  );
}

function AccountDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="settings-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function LinkedInConnection({ status }: { status: LinkedInStatus | null }) {
  if (!status) return <div className="status">Checking LinkedIn status...</div>;
  if (!status.configured) {
    return (
      <div className="status">
        <strong>LinkedIn OAuth is not configured yet.</strong>
        <p className="fine-print" style={{ marginTop: 6 }}>
          Add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to .env.local, set the LinkedIn redirect URL to
          http://localhost:3002/api/linkedin/callback, then restart the local server.
        </p>
      </div>
    );
  }
  if (!status.account) {
    return (
      <div className="status">
        <strong>No LinkedIn account connected.</strong>
        {status.provider === "mock" ? (
          <p className="fine-print" style={{ marginTop: 6 }}>
            Sandbox mode is active. Connect LinkedIn to run the local consent, callback, sync, analytics, and DNA flow.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="status">
      <strong>{status.account.displayName || "LinkedIn account"}</strong>
      <p className="fine-print" style={{ marginTop: 6 }}>
        {status.provider === "mock" ? "Sandbox connection" : "Live connection"} - Imported posts: {status.account.postsImported}
        {status.account.lastSyncedAt ? ` - Last synced ${new Date(status.account.lastSyncedAt).toLocaleString()}` : ""}
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metric">
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

function DraftEditor({ draft, onUpdated }: { draft: Draft; onUpdated: () => Promise<void> }) {
  const [title, setTitle] = useState(draft.title);
  const [content, setContent] = useState(draft.content);
  const [scheduledAt, setScheduledAt] = useState(toDateTimeInputValue(draft.scheduledAt));
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [score, setScore] = useState<PostScore | null>(null);
  const [scoreModel, setScoreModel] = useState<string>("");

  useEffect(() => {
    setTitle(draft.title);
    setContent(draft.content);
    setScheduledAt(toDateTimeInputValue(draft.scheduledAt));
    setStatus("");
    setError("");
    setScore(null);
    setScoreModel("");
    setRewriting(false);
  }, [draft]);

  async function save() {
    setBusy(true);
    setError("");
    const response = await fetch(`/api/drafts/${draft.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    const payload = await readPayload(response);
    if (!response.ok) {
      setError(payload.error?.message ?? "Draft update failed.");
    } else {
      setStatus("Draft saved");
      await onUpdated();
    }
    setBusy(false);
  }

  async function schedule() {
    if (!scheduledAt) return;
    setBusy(true);
    setError("");
    const response = await fetch(`/api/drafts/${draft.id}/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledAt: new Date(scheduledAt).toISOString() }),
    });
    const payload = await readPayload(response);
    if (!response.ok) {
      setError(payload.error?.message ?? "Schedule failed.");
    } else {
      setStatus("Draft scheduled");
      await onUpdated();
    }
    setBusy(false);
  }

  async function publish() {
    setPublishing(true);
    setError("");
    const response = await fetch(`/api/drafts/${draft.id}/publish`, { method: "POST" });
    const payload = await readPayload(response);
    if (!response.ok) {
      setError(payload.error?.message ?? "Publish failed.");
    } else {
      const urn = (payload.linkedin as { urn?: string } | undefined)?.urn;
      setStatus(urn ? `Published to LinkedIn: ${urn}` : "Published to LinkedIn");
      await onUpdated();
    }
    setPublishing(false);
  }

  async function checkScore() {
    setScoring(true);
    setError("");
    const response = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post: content }),
    });
    const payload = await readPayload(response);
    if (!response.ok) {
      setError(payload.error?.message ?? "Score check failed.");
    } else {
      const data = payload as { score: PostScore; model?: string };
      setScore(data.score);
      setScoreModel(data.model ?? "");
    }
    setScoring(false);
  }

  async function rewriteWithScore() {
    if (!content.trim() || !score) return;
    setRewriting(true);
    setError("");
    setStatus("Improving draft...");
    const response = await fetch("/api/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post: content, score }),
    });
    const payload = await readPayload(response);
    if (!response.ok) {
      setError(payload.error?.message ?? "Rewrite failed.");
      setStatus("");
    } else {
      const rewrite = payload as RewriteResult;
      setContent(rewrite.post);
      setScore(null);
      setScoreModel("");
      setStatus(`Improved draft. ${rewrite.changes.join(" ")}`);
    }
    setRewriting(false);
  }

  return (
    <div className="input-grid">
      <label className="field">
        <span>Title</span>
        <input onChange={(event) => setTitle(event.target.value)} type="text" value={title} />
      </label>
      <label className="field">
        <span>{content.length} characters</span>
        <textarea className="post-editor" onChange={(event) => setContent(event.target.value)} rows={18} value={content} />
      </label>
      <div className="draft-meta">
        <span className={`badge ${draft.status}`}>{draft.status}</span>
        {draft.scheduledAt ? <span>Scheduled {formatDraftDate(draft.scheduledAt)}</span> : null}
        {draft.publishedAt ? <span>Published {formatDraftDate(draft.publishedAt)}</span> : null}
        {draft.linkedinPostUrn ? <span>{draft.linkedinPostUrn}</span> : null}
      </div>
      <label className="field">
        <span>Schedule time</span>
        <input onChange={(event) => setScheduledAt(event.target.value)} type="datetime-local" value={scheduledAt} />
      </label>
      <div className="actions">
        <button className="primary-button" disabled={busy} onClick={save} type="button">
          {busy ? "Saving..." : "Save as draft"}
        </button>
        <button className="secondary-button" disabled={busy || !scheduledAt} onClick={schedule} type="button">
          <CalendarDays size={16} /> Schedule
        </button>
        <button className="secondary-button" disabled={publishing || content.length < 20} onClick={publish} type="button">
          <Send size={16} /> {publishing ? "Publishing..." : "Publish"}
        </button>
        <button className="secondary-button" disabled={scoring || content.length < 40} onClick={checkScore} type="button">
          <CheckCircle2 size={16} /> {scoring ? "Checking..." : "Check score"}
        </button>
        <button className="secondary-button" disabled={!score || rewriting} onClick={rewriteWithScore} type="button">
          <Sparkles size={16} /> {rewriting ? "Improving..." : "Improve with score"}
        </button>
      </div>
      {status && <div className="status">{status}</div>}
      {error && <div className="status error">{error}</div>}
      {score ? <ScorePanel model={scoreModel} score={score} /> : null}
    </div>
  );
}

function ScorePanel({ model, score }: { model: string; score: PostScore }) {
  return (
    <section className="score-panel">
      {model ? <p className="fine-print" style={{ marginBottom: 10 }}>Analyzed by {model}</p> : null}
      <div className="dashboard-grid">
        <Metric label="Performance" value={`${score.performanceScore}/10`} />
        <Metric label="Authenticity" value={`${score.authenticityScore}/10`} />
        <Metric label="AI-slop risk" value={score.slopRisk} />
        <Metric label="Flags" value={score.findings.length} />
      </div>
      <p className="status" style={{ marginTop: 12 }}>{score.summary}</p>
      <div className="score-grid">
        <div>
          <h3>Voice check</h3>
          <ul className="plain-list">
            {score.voiceCheck.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Criteria</h3>
          <ul className="plain-list">
            {score.criteria.map((item) => (
              <li key={item.name}>
                <strong>{item.name}</strong>: {item.feedback}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {score.findings.length ? (
        <div className="findings-list">
          <h3>AI-slop fixes</h3>
          {score.findings.map((finding) => (
            <article className="finding-card" key={`${finding.line}-${finding.reason}`}>
              <strong>{finding.severity.toUpperCase()}</strong>
              <p>{finding.reason}</p>
              <blockquote>{finding.line}</blockquote>
              <p className="fine-print">{finding.suggestion}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function CompactDraftGrid({ drafts, empty }: { drafts: Draft[]; empty: string }) {
  if (!drafts.length) return <div className="status">{empty}</div>;

  return (
    <div className="compact-draft-grid">
      {drafts.map((draft) => (
        <CompactDraftCard draft={draft} key={draft.id} />
      ))}
    </div>
  );
}

function CompactDraftCard({ draft }: { draft: Draft }) {
  return (
    <article className="compact-draft-card">
      <header>
        <strong>{draft.title}</strong>
        <span className={`badge ${draft.status}`}>{draft.status}</span>
      </header>
      <p>{draft.content}</p>
      <div className="draft-meta">
        <span>{draft.sourceType}</span>
        {draft.scheduledAt ? <span>Scheduled {formatDraftDate(draft.scheduledAt)}</span> : null}
        {draft.publishedAt ? <span>Published {formatDraftDate(draft.publishedAt)}</span> : null}
      </div>
    </article>
  );
}

function BestTimeList({ slots }: { slots: PostingSlot[] }) {
  return (
    <div className="slot-grid">
      {slots.map((slot) => (
        <article className="slot-card" key={`${slot.label}-${slot.source}`}>
          <span className={`slot-source ${slot.source}`}>{slot.source === "linkedin" ? "LinkedIn data" : "Baseline"}</span>
          <strong>{slot.label}</strong>
          <p>{slot.detail}</p>
        </article>
      ))}
    </div>
  );
}

function RealDataEmptyState({
  actionLabel,
  message,
  onAction,
  title,
}: {
  actionLabel: string;
  message: string;
  onAction: () => void;
  title: string;
}) {
  return (
    <div className="empty-state large">
      <strong>{title}</strong>
      <p>{message}</p>
      <button className="secondary-button" onClick={onAction} type="button">
        {actionLabel}
      </button>
    </div>
  );
}

function DraftList({
  drafts,
  empty,
  onSelect,
  selectedId,
}: {
  drafts: Draft[];
  empty: string;
  onSelect?: (id: string) => void;
  selectedId?: string | null;
}) {
  if (!drafts.length) return <div className="status">{empty}</div>;

  return (
    <div className="draft-list">
      {drafts.map((draft) => (
        <article
          className={`draft-card ${selectedId === draft.id ? "active" : ""}`}
          key={draft.id}
          onClick={() => onSelect?.(draft.id)}
          onKeyDown={(event) => {
            if (onSelect && (event.key === "Enter" || event.key === " ")) onSelect(draft.id);
          }}
          role={onSelect ? "button" : undefined}
          tabIndex={onSelect ? 0 : undefined}
        >
          <header>
            <span>{draft.title}</span>
            <span className={`badge ${draft.status}`}>{draft.status}</span>
          </header>
          <div className="draft-meta">
            <span>{draft.sourceType}</span>
            {draft.scheduledAt ? <span>Scheduled {formatDraftDate(draft.scheduledAt)}</span> : null}
            {draft.publishedAt ? <span>Published {formatDraftDate(draft.publishedAt)}</span> : null}
          </div>
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

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatOptionalNumber(value: number | null | undefined) {
  return value === null || value === undefined ? "Not available" : formatNumber(value);
}

function getInitials(user: AppUser) {
  const source = user.name || user.email || "Lucan user";
  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getBestPostingSlots(linkedin: LinkedInDashboardAnalytics | null | undefined): PostingSlot[] {
  const groups = new Map<string, { day: string; impact: number; posts: number; time: string }>();

  for (const post of linkedin?.posts ?? []) {
    if (!post.publishedAt) continue;
    const date = new Date(post.publishedAt);
    if (Number.isNaN(date.getTime())) continue;

    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    const hour = new Date(date);
    hour.setMinutes(0, 0, 0);
    const time = hour.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const key = `${day}-${time}`;
    const existing = groups.get(key) ?? { day, impact: 0, posts: 0, time };
    existing.impact += getPostImpact(post);
    existing.posts += 1;
    groups.set(key, existing);
  }

  const measured = [...groups.values()]
    .filter((slot) => slot.impact > 0)
    .map((slot) => ({ ...slot, score: Math.round(slot.impact / Math.max(1, slot.posts)) }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  if (measured.length) {
    return measured.map((slot) => ({
      label: `${slot.day} ${slot.time}`,
      detail: `${slot.posts} imported post${slot.posts > 1 ? "s" : ""}, avg ${formatNumber(slot.score)} impact`,
      score: slot.score,
      source: "linkedin",
    }));
  }

  return [
    { label: "Tue 9:00 AM", detail: "Baseline slot until LinkedIn history is synced.", score: 0, source: "baseline" },
    { label: "Wed 12:30 PM", detail: "Baseline slot until enough real post analytics exist.", score: 0, source: "baseline" },
    { label: "Thu 5:30 PM", detail: "Baseline slot, not measured from your account yet.", score: 0, source: "baseline" },
  ];
}

function getTopLinkedInPosts(linkedin: LinkedInDashboardAnalytics | null | undefined, limit: number) {
  return [...(linkedin?.posts ?? [])]
    .sort((left, right) => getPostImpact(right) - getPostImpact(left))
    .slice(0, limit);
}

function getPostImpact(post: LinkedInImportedPost) {
  return (
    post.analytics.impressions +
    post.analytics.membersReached +
    post.analytics.reactions * 8 +
    post.analytics.comments * 16 +
    post.analytics.reshares * 20 +
    post.analytics.saves * 12 +
    post.analytics.linkClicks * 6
  );
}

function deriveInspirationAngle(commentary: string) {
  const firstLine = commentary
    .split(/\n+/)
    .map((line) => line.trim())
    .find(Boolean);
  if (!firstLine) return "Revisit a proven topic";
  return shorten(firstLine.replace(/^[-*#\s]+/, ""), 96);
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function shorten(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}

function toDateTimeInputValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function formatDraftDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}
