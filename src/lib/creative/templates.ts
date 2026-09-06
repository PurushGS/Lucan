import type {
  CarouselSlide,
  CreativeDocument,
  CreativeElement,
  CreativeFormat,
  CreativeTemplateKind,
} from "@/src/types/lucan";

export type CreativeTemplate = {
  id: string;
  name: string;
  kind: CreativeTemplateKind;
  description: string;
  format: CreativeFormat;
  accent: string;
};

export const creativeFormats: Record<CreativeFormat, { label: string; width: number; height: number }> = {
  square: { label: "LinkedIn post", width: 1080, height: 1080 },
  carousel: { label: "LinkedIn carousel", width: 1080, height: 1350 },
  story: { label: "Story", width: 1080, height: 1920 },
  banner: { label: "Banner", width: 1584, height: 396 },
};

export const creativeTemplates: CreativeTemplate[] = [
  {
    id: "lucan-advocacy-first",
    name: "Advocacy First",
    kind: "carousel",
    description: "Opinion-led carousel with a strong opening and proof points.",
    format: "carousel",
    accent: "#039487",
  },
  {
    id: "lucan-stat-grid",
    name: "Stat Grid",
    kind: "infographic",
    description: "Big number, supporting context, and three takeaway cells.",
    format: "square",
    accent: "#2166d1",
  },
  {
    id: "lucan-process-flow",
    name: "Process Flow",
    kind: "infographic",
    description: "Step-by-step visual for frameworks and operating lessons.",
    format: "square",
    accent: "#147b57",
  },
  {
    id: "lucan-compare",
    name: "Compare",
    kind: "infographic",
    description: "Two-column comparison for before/after or old/new thinking.",
    format: "square",
    accent: "#047168",
  },
  {
    id: "lucan-roadmap",
    name: "Roadmap",
    kind: "carousel",
    description: "A concise multi-step plan with one idea per slide.",
    format: "carousel",
    accent: "#a86c11",
  },
  {
    id: "lucan-quote-frame",
    name: "Quote Frame",
    kind: "image",
    description: "Bold quote card for a single memorable idea.",
    format: "square",
    accent: "#10202a",
  },
  {
    id: "lucan-checklist",
    name: "Checklist",
    kind: "carousel",
    description: "Practical checklist carousel for tactical posts.",
    format: "carousel",
    accent: "#039487",
  },
  {
    id: "lucan-cover-card",
    name: "Cover Card",
    kind: "image",
    description: "Single-slide cover visual for announcements or insights.",
    format: "square",
    accent: "#2166d1",
  },
];

export function getCreativeTemplate(templateId: string) {
  return creativeTemplates.find((template) => template.id === templateId) ?? creativeTemplates[0];
}

export function createCreativeDocument(input: {
  templateId: string;
  title: string;
  slides: CarouselSlide[];
  format?: CreativeFormat;
}): CreativeDocument {
  const template = getCreativeTemplate(input.templateId);
  const format = input.format ?? template.format;
  const size = creativeFormats[format];
  const slides = normalizeSlides(input.title, input.slides);

  return {
    version: 1,
    templateId: template.id,
    format,
    width: size.width,
    height: size.height,
    pages: slides.map((slide, index) => ({
      id: `page-${index + 1}`,
      name: index === 0 ? "Cover" : `Page ${index + 1}`,
      background: index % 2 === 0 ? "#ffffff" : "#edf7f6",
      elements: createElementsForTemplate(template, slide, index, slides.length, size.width, size.height),
    })),
  };
}

function normalizeSlides(title: string, slides: CarouselSlide[]) {
  const usable = slides.length
    ? slides
    : [
        {
          index: 1,
          headline: title || "Start with one clear idea",
          body: "Use this canvas to shape the point before you post.",
        },
      ];

  return usable.slice(0, 8).map((slide, index) => ({
    index: index + 1,
    headline: slide.headline || (index === 0 ? title : `Slide ${index + 1}`),
    body: slide.body || "Add supporting detail here.",
  }));
}

function createElementsForTemplate(
  template: CreativeTemplate,
  slide: CarouselSlide,
  index: number,
  total: number,
  width: number,
  height: number,
): CreativeElement[] {
  const base: CreativeElement[] = [
    shape("top-rule", 80, 90, width - 160, 10, template.accent, 10),
    text("brand", "Lucan", 80, height - 110, 180, 40, 28, "#667985", 700),
    text("page", `${index + 1}/${total}`, width - 190, height - 110, 110, 40, 28, "#667985", 700),
  ];

  if (template.id === "lucan-stat-grid") {
    return [
      ...base,
      text("headline", slide.headline, 80, 170, width - 160, 180, 70, "#10202a", 800),
      shape("stat", 80, 410, 260, 180, template.accent, 18),
      text("stat-text", "01", 118, 456, 160, 90, 76, "#ffffff", 800),
      text("body", slide.body, 390, 408, width - 470, 210, 38, "#10202a", 650),
      shape("cell-a", 80, 700, 280, 210, "#edf7f6", 16),
      shape("cell-b", 400, 700, 280, 210, "#edf7f6", 16),
      shape("cell-c", 720, 700, 280, 210, "#edf7f6", 16),
    ];
  }

  if (template.id === "lucan-process-flow" || template.id === "lucan-roadmap") {
    return [
      ...base,
      text("headline", slide.headline, 80, 170, width - 160, 170, 64, "#10202a", 800),
      ...[0, 1, 2].flatMap((step) => [
        shape(`step-${step}`, 110 + step * 315, 470, 210, 210, step === index % 3 ? template.accent : "#edf7f6", 105),
        text(`step-number-${step}`, `${step + 1}`, 185 + step * 315, 528, 70, 80, 64, step === index % 3 ? "#ffffff" : "#10202a", 800),
      ]),
      text("body", slide.body, 100, 780, width - 200, 260, 42, "#10202a", 650),
    ];
  }

  if (template.id === "lucan-compare") {
    return [
      ...base,
      text("headline", slide.headline, 80, 170, width - 160, 150, 62, "#10202a", 800),
      shape("left", 80, 390, 430, 430, "#edf7f6", 18),
      shape("right", 570, 390, 430, 430, template.accent, 18),
      text("left-label", "Before", 120, 440, 300, 60, 38, "#10202a", 800),
      text("right-label", "Better", 610, 440, 300, 60, 38, "#ffffff", 800),
      text("body-left", "Generic, broad, and easy to ignore.", 120, 540, 320, 180, 34, "#10202a", 650),
      text("body-right", slide.body, 610, 540, 330, 190, 34, "#ffffff", 650),
    ];
  }

  if (template.id === "lucan-quote-frame") {
    return [
      shape("frame", 70, 70, width - 140, height - 140, "#10202a", 24),
      text("quote", slide.headline, 140, 210, width - 280, 430, 76, "#ffffff", 800),
      text("body", slide.body, 145, 720, width - 290, 180, 38, "#d8e6e8", 600),
      text("brand", "Lucan", 140, height - 150, 180, 40, 28, "#8aa0ab", 700),
      text("page", `${index + 1}/${total}`, width - 250, height - 150, 120, 40, 28, "#8aa0ab", 700),
    ];
  }

  if (template.id === "lucan-checklist") {
    return [
      ...base,
      text("headline", slide.headline, 80, 170, width - 160, 160, 62, "#10202a", 800),
      ...[0, 1, 2].flatMap((row) => [
        shape(`check-${row}`, 95, 410 + row * 150, 58, 58, template.accent, 29),
        text(`tick-${row}`, "OK", 103, 415 + row * 150, 45, 44, 28, "#ffffff", 800),
        text(`line-${row}`, row === 0 ? slide.body : row === 1 ? "Keep it specific." : "Make one clear ask.", 180, 400 + row * 150, 760, 90, 38, "#10202a", 650),
      ]),
    ];
  }

  if (template.id === "lucan-cover-card") {
    return [
      shape("band", 0, 0, width, 290, template.accent, 0),
      text("label", "LINKEDIN VISUAL", 80, 90, 380, 40, 28, "#ffffff", 800),
      text("headline", slide.headline, 80, 370, width - 160, 280, 74, "#10202a", 800),
      text("body", slide.body, 84, 720, width - 168, 180, 38, "#667985", 600),
      text("brand", "Lucan", 80, height - 110, 180, 40, 28, "#667985", 700),
    ];
  }

  return [
    ...base,
    shape("accent-block", 80, 250, 170, 170, template.accent, 24),
    text("headline", slide.headline, 300, 220, width - 380, 260, 72, "#10202a", 800),
    text("body", slide.body, 100, 570, width - 200, 310, 42, "#10202a", 650),
    shape("footer-rule", 80, height - 185, width - 160, 2, "#d8e6e8", 1),
  ];
}

function text(
  id: string,
  value: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fontSize: number,
  color: string,
  fontWeight: number,
): CreativeElement {
  return { id, kind: "text", x, y, width, height, text: value, fontSize, color, fontWeight };
}

function shape(
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  radius: number,
): CreativeElement {
  return { id, kind: "shape", x, y, width, height, fill, radius };
}
