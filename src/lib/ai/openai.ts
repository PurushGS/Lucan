import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAIClient() {
  if (client) return client;

  if (process.env.OPENROUTER_API_KEY) {
    client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002",
        "X-OpenRouter-Title": "Lucan",
      },
    });
    return client;
  }

  if (process.env.OPENAI_API_KEY) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return client;
  }

  throw new Error("Missing OPENROUTER_API_KEY. Add a real OpenRouter API key to .env.local to enable generation.");
}

export function getModel() {
  return process.env.OPENROUTER_MODEL || process.env.OPENAI_MODEL || "openai/gpt-4.1-nano";
}

export function getScoreModels() {
  const configured =
    process.env.OPENROUTER_SCORE_MODELS || process.env.OPENROUTER_SCORE_MODEL || process.env.OPENAI_SCORE_MODEL;

  return configured
    ? configured
        .split(",")
        .map((model) => model.trim())
        .filter(Boolean)
    : ["z-ai/glm-5.2:free", "z-ai/glm-5.3-flash"];
}

export function isRetryableAIError(error: unknown) {
  const status = typeof error === "object" && error !== null && "status" in error ? Number(error.status) : null;
  return status === 429 || status === 502 || status === 503 || status === 504;
}

function getRequestTimeoutMs() {
  const value = Number(process.env.AI_REQUEST_TIMEOUT_MS ?? 45_000);
  return Number.isFinite(value) && value > 0 ? value : 45_000;
}

export async function completeJson(prompt: string, options?: { model?: string; temperature?: number }) {
  const completion = await getOpenAIClient().chat.completions.create(
    {
      model: options?.model ?? getModel(),
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: options?.temperature ?? 0.65,
    },
    { timeout: getRequestTimeoutMs() },
  );

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("The model returned an empty response.");
  }

  return content;
}
