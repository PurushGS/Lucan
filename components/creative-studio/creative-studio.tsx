"use client";

import { Download, FileImage, Layers3, Loader2, Save, Sparkles, Trash2 } from "lucide-react";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { createCreativeDocument, creativeFormats, creativeTemplates, getCreativeTemplate } from "@/src/lib/creative/templates";
import type { CreativeDesign, CreativeDocument, CreativeElement, CreativePage, CreativeTemplateKind } from "@/src/types/lucan";

type CreativeResponse = {
  title: string;
  kind: CreativeTemplateKind;
  format: CreativeDocument["format"];
  width: number;
  height: number;
  document: CreativeDocument;
};

type DesignListResponse = {
  designs: CreativeDesign[];
};

const starterDocument = createCreativeDocument({
  templateId: creativeTemplates[0].id,
  title: "One useful idea",
  slides: [
    {
      index: 1,
      headline: "One useful idea beats a crowded design",
      body: "Start with a sharp point. Turn it into a clear visual. Export it when it is ready.",
    },
  ],
});

export function CreativeStudio() {
  const [designs, setDesigns] = useState<CreativeDesign[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(creativeTemplates[0].id);
  const [source, setSource] = useState("");
  const [slideCount, setSlideCount] = useState(5);
  const [title, setTitle] = useState("Untitled visual");
  const [designId, setDesignId] = useState<string | null>(null);
  const [document, setDocument] = useState<CreativeDocument>(starterDocument);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const template = useMemo(() => getCreativeTemplate(selectedTemplateId), [selectedTemplateId]);
  const selectedPage = document.pages[selectedPageIndex] ?? document.pages[0];

  useEffect(() => {
    void refreshDesigns();
  }, []);

  async function refreshDesigns() {
    const response = await fetch("/api/creative/designs");
    if (!response.ok) return;
    const payload = (await response.json()) as DesignListResponse;
    setDesigns(payload.designs);
  }

  async function generateDesign() {
    setLoading(true);
    setError("");
    setStatus("Generating carousel copy...");

    const response = await fetch("/api/creative/carousel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, templateId: selectedTemplateId, slideCount }),
    });
    const payload = await readPayload(response);

    if (!response.ok) {
      setError(payload.error?.message ?? "Creative generation failed.");
      setStatus("");
      setLoading(false);
      return;
    }

    const data = payload as CreativeResponse;
    setDesignId(null);
    setTitle(data.title);
    setDocument(data.document);
    setSelectedPageIndex(0);
    setStatus("Generated. Review the pages, edit copy, then save or export.");
    setLoading(false);
  }

  function startFromTemplate(templateId = selectedTemplateId) {
    const chosen = getCreativeTemplate(templateId);
    const nextDocument = createCreativeDocument({
      templateId: chosen.id,
      title: title || chosen.name,
      slides: [
        {
          index: 1,
          headline: title || chosen.name,
          body: source || "Add your point, proof, or CTA here.",
        },
      ],
      format: chosen.format,
    });
    setDesignId(null);
    setSelectedTemplateId(templateId);
    setTitle(chosen.name);
    setDocument(nextDocument);
    setSelectedPageIndex(0);
    setStatus("Template loaded. Edit the text or generate with AI.");
    setError("");
  }

  async function saveDesign() {
    setSaving(true);
    setError("");
    const activeTemplate = getCreativeTemplate(document.templateId);
    const body = {
      title: title.trim() || "Untitled visual",
      kind: activeTemplate.kind,
      format: document.format,
      width: document.width,
      height: document.height,
      document,
    };

    const response = await fetch(designId ? `/api/creative/designs/${designId}` : "/api/creative/designs", {
      method: designId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await readPayload(response);

    if (!response.ok) {
      setError(payload.error?.message ?? "Save failed.");
    } else {
      if (!designId && typeof payload.id === "string") setDesignId(payload.id);
      setStatus("Saved to Creative Studio.");
      await refreshDesigns();
    }
    setSaving(false);
  }

  async function removeDesign(id: string) {
    setError("");
    const response = await fetch(`/api/creative/designs/${id}`, { method: "DELETE" });
    const payload = await readPayload(response);
    if (!response.ok) {
      setError(payload.error?.message ?? "Delete failed.");
      return;
    }
    if (designId === id) setDesignId(null);
    setStatus("Design removed.");
    await refreshDesigns();
  }

  function openDesign(design: CreativeDesign) {
    setDesignId(design.id);
    setTitle(design.title);
    setDocument(design.document);
    setSelectedTemplateId(design.document.templateId);
    setSelectedPageIndex(0);
    setStatus("Design opened.");
    setError("");
  }

  function updateElement(elementId: string, value: string) {
    setDocument((current) => ({
      ...current,
      pages: current.pages.map((page, pageIndex) =>
        pageIndex === selectedPageIndex
          ? {
              ...page,
              elements: page.elements.map((element) => (element.id === elementId ? { ...element, text: value } : element)),
            }
          : page,
      ),
    }));
  }

  function updateBackground(value: string) {
    setDocument((current) => ({
      ...current,
      pages: current.pages.map((page, pageIndex) => (pageIndex === selectedPageIndex ? { ...page, background: value } : page)),
    }));
  }

  function addPage() {
    setDocument((current) => {
      const lastPage = current.pages[current.pages.length - 1] ?? starterDocument.pages[0];
      return {
        ...current,
        pages: [
          ...current.pages,
          {
            ...lastPage,
            id: `page-${Date.now()}`,
            name: `Page ${current.pages.length + 1}`,
            elements: lastPage.elements.map((element) => ({ ...element, id: `${element.id}-${Date.now()}` })),
          },
        ],
      };
    });
    setSelectedPageIndex(document.pages.length);
  }

  async function exportPng() {
    if (!svgRef.current) return;
    setExporting(true);
    setError("");
    try {
      const serializer = new XMLSerializer();
      const svg = serializer.serializeToString(svgRef.current);
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const image = new Image();
      image.decoding = "async";
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Could not render design for export."));
        image.src = url;
      });
      const canvas = window.document.createElement("canvas");
      canvas.width = document.width;
      canvas.height = document.height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas export is not available in this browser.");
      context.drawImage(image, 0, 0);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL("image/png");
      const link = window.document.createElement("a");
      link.href = pngUrl;
      link.download = `${slugify(title)}-page-${selectedPageIndex + 1}.png`;
      link.click();
      setStatus("PNG exported.");
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Export failed.");
    }
    setExporting(false);
  }

  return (
    <div className="creative-studio-layout">
      <section className="panel section creative-library">
        <div className="section-heading-row">
          <div>
            <h2>Creative Studio</h2>
            <p className="fine-print">Create LinkedIn visuals from templates and real AI-generated slide copy.</p>
          </div>
          <FileImage size={18} />
        </div>

        <div className="actions">
          <button className="primary-button" disabled={loading} onClick={generateDesign} type="button">
            {loading ? <Loader2 className="spin" size={16} /> : <Sparkles size={16} />}
            {loading ? "Generating..." : "Generate visual"}
          </button>
          <button className="secondary-button" onClick={() => startFromTemplate()} type="button">
            Start blank
          </button>
        </div>

        <label className="field">
          <span>Source idea or draft</span>
          <textarea
            onChange={(event) => setSource(event.target.value)}
            placeholder="Paste a post draft or describe the carousel you want."
            rows={6}
            value={source}
          />
        </label>

        <label className="field">
          <span>Slides</span>
          <input max={8} min={1} onChange={(event) => setSlideCount(Number(event.target.value))} type="number" value={slideCount} />
        </label>

        <div>
          <h3 className="compact-heading">Templates</h3>
          <div className="creative-template-grid">
            {creativeTemplates.map((item) => (
              <button
                className={`creative-template ${selectedTemplateId === item.id ? "active" : ""}`}
                key={item.id}
                onClick={() => startFromTemplate(item.id)}
                type="button"
              >
                <span style={{ background: item.accent }} />
                <strong>{item.name}</strong>
                <small>{item.kind}</small>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="compact-heading">Saved designs</h3>
          {designs.length ? (
            <div className="saved-design-list">
              {designs.map((design) => (
                <div className="saved-design-row" key={design.id}>
                  <button className="saved-design" onClick={() => openDesign(design)} type="button">
                    <strong>{design.title}</strong>
                    <span>{creativeFormats[design.format].label}</span>
                  </button>
                  <button
                    aria-label={`Delete ${design.title}`}
                    className="icon-button"
                    onClick={() => void removeDesign(design.id)}
                    title="Delete design"
                    type="button"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No creative designs saved yet.</div>
          )}
        </div>
      </section>

      <section className="panel section creative-canvas-panel">
        <div className="creative-toolbar">
          <label className="field compact-field">
            <span>Title</span>
            <input onChange={(event) => setTitle(event.target.value)} value={title} />
          </label>
          <div className="actions">
            <button className="secondary-button" disabled={saving} onClick={saveDesign} type="button">
              <Save size={16} />
              {saving ? "Saving..." : "Save"}
            </button>
            <button className="secondary-button" disabled={exporting} onClick={exportPng} type="button">
              <Download size={16} />
              {exporting ? "Exporting..." : "PNG"}
            </button>
          </div>
        </div>

        {status ? <div className="status">{status}</div> : null}
        {error ? <div className="status error">{error}</div> : null}

        <div className="creative-workbench">
          <div className="page-strip" aria-label="Design pages">
            {document.pages.map((page, index) => (
              <button
                className={`page-thumb ${selectedPageIndex === index ? "active" : ""}`}
                key={page.id}
                onClick={() => setSelectedPageIndex(index)}
                type="button"
              >
                {index + 1}
              </button>
            ))}
            <button className="page-thumb add" onClick={addPage} type="button">
              +
            </button>
          </div>
          <div className="creative-preview-frame">
            {selectedPage ? <CreativeSvg document={document} page={selectedPage} ref={svgRef} /> : null}
          </div>
        </div>
      </section>

      <section className="panel section creative-inspector">
        <div className="section-heading-row">
          <h2>Page editor</h2>
          <Layers3 size={18} />
        </div>
        <label className="field">
          <span>Background</span>
          <input onChange={(event) => updateBackground(event.target.value)} type="color" value={selectedPage?.background ?? "#ffffff"} />
        </label>
        {selectedPage?.elements.filter((element) => element.kind === "text").length ? (
          selectedPage.elements
            .filter((element) => element.kind === "text")
            .map((element) => (
              <label className="field" key={element.id}>
                <span>{humanizeElementId(element.id)}</span>
                <textarea onChange={(event) => updateElement(element.id, event.target.value)} rows={3} value={element.text ?? ""} />
              </label>
            ))
        ) : (
          <div className="empty-state">No text layers on this page.</div>
        )}
      </section>
    </div>
  );
}

const CreativeSvg = forwardRef<SVGSVGElement, { document: CreativeDocument; page: CreativePage }>(function CreativeSvg(
  { document, page },
  ref,
) {
  return (
    <svg
      aria-label={`${page.name} preview`}
      className="creative-svg"
      height={document.height}
      ref={ref}
      role="img"
      viewBox={`0 0 ${document.width} ${document.height}`}
      width={document.width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill={page.background} height={document.height} width={document.width} x="0" y="0" />
      {page.elements.map((element) => (
        <CreativeSvgElement element={element} key={element.id} />
      ))}
    </svg>
  );
});

function CreativeSvgElement({ element }: { element: CreativeElement }) {
  if (element.kind === "shape") {
    return (
      <rect
        fill={element.fill ?? "#edf7f6"}
        height={element.height}
        rx={element.radius ?? 0}
        stroke={element.stroke}
        width={element.width}
        x={element.x}
        y={element.y}
      />
    );
  }

  const fontSize = element.fontSize ?? 36;
  const lines = wrapText(element.text ?? "", element.width, fontSize).slice(0, Math.max(1, Math.floor(element.height / (fontSize * 1.18))));

  return (
    <text
      fill={element.color ?? "#10202a"}
      fontFamily="Arial, sans-serif"
      fontSize={fontSize}
      fontWeight={element.fontWeight ?? 600}
      x={element.x}
      y={element.y + fontSize}
    >
      {lines.map((line, index) => (
        <tspan dy={index === 0 ? 0 : fontSize * 1.18} key={`${line}-${index}`} x={element.x}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function wrapText(value: string, width: number, fontSize: number) {
  const words = value.split(/\s+/).filter(Boolean);
  const maxChars = Math.max(8, Math.floor(width / (fontSize * 0.5)));
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

async function readPayload(response: Response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "lucan-creative";
}

function humanizeElementId(id: string) {
  return id
    .replace(/-[0-9]+$/g, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
