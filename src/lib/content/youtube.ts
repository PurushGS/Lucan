import { YoutubeTranscript } from "youtube-transcript";

export function extractVideoId(input: string) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match?.[1]) return match[1];
  }

  return input.trim();
}

export async function extractYoutubeTranscript(input: string) {
  const videoId = extractVideoId(input);
  const transcript = await YoutubeTranscript.fetchTranscript(videoId);

  if (!transcript.length) {
    throw new Error("No transcript was found for this YouTube video.");
  }

  return transcript.map((part) => part.text).join(" ");
}
