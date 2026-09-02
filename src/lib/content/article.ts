import * as cheerio from "cheerio";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0 Safari/537.36";

export async function extractArticle(url: string) {
  const normalizedUrl = normalizeUrl(url);
  const response = await fetch(normalizedUrl, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Could not fetch article: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  $("script, style, nav, footer, header, aside, noscript").remove();

  const title = $("meta[property='og:title']").attr("content") || $("title").first().text();
  const description = $("meta[name='description']").attr("content") || "";
  const mainText = $("article").text() || $("main").text() || $("body").text();
  const content = [title, description, mainText].filter(Boolean).join("\n\n").replace(/\s+/g, " ").trim();

  if (content.length < 120) {
    throw new Error("The article did not expose enough readable text.");
  }

  return content.slice(0, 24000);
}

function normalizeUrl(raw: string) {
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}
