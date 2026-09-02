import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAIClient() {
  if (client) return client;

  if (process.env.OPENROUTER_API_KEY) {
    client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
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
  return process.env.OPENROUTER_MODEL || process.env.OPENAI_MODEL || "openai/gpt-4.1-mini";
}

export async function completeJson(prompt: string) {
  const completion = await getOpenAIClient().chat.completions.create({
    model: getModel(),
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.65,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("The model returned an empty response.");
  }

  return content;
}
