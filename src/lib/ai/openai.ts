import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY. Add a real OpenAI API key to .env.local to enable generation.");
  }

  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export function getModel() {
  return process.env.OPENAI_MODEL || "gpt-4.1-mini";
}
