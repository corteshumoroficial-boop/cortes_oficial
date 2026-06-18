import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { YoutubeTranscript } from "youtube-transcript";
import { YtCaptionKit } from "yt-caption-kit";

const InputSchema = z.object({
  url: z.string().url().max(500),
});

export interface FetchTranscriptResult {
  transcript: string;
  rawTranscript: string;
  videoTitle: string;
  videoId: string;
  source: "youtube";
  error?: string;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function cleanTranscriptText(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      let cleaned = line.trim();

      cleaned = cleaned.replace(/^\[(\d{1,2}:){1,2}\d{2}(?:\.\d+)?\]\s*/g, "");
      cleaned = cleaned.replace(/^\[(\d{1,2}:){1,2}\d{2}(?:\.\d+)?\]\s*/g, "");
      cleaned = cleaned.replace(/^\d{1,2}:\d{2}(?::\d{2})?\s*/g, "");
      cleaned = cleaned.replace(/\[(.*?)\]/g, (match, content: string) => {
        const normalized = content.toLowerCase().trim();
        if (["risos", "rindo", "risada", "musica", "música", "aplausos", "silencio", "silêncio", "pausa", "pause", "laugh", "laughter", "music"].includes(normalized)) {
          return "";
        }
        return "";
      });
      cleaned = cleaned.replace(/(?:->|=>|→|<-|←|↔|<->|\u25B6|\u25C0|\u25AA|\u25CF|\u2022|\u2023|\u25E6)/g, " ");
      cleaned = cleaned.replace(/[^\p{L}\p{N}\s,.;:!?"'()-]/gu, " ");
      cleaned = cleaned.replace(/\s{2,}/g, " ");
      cleaned = cleaned.replace(/[\t]+/g, " ");
      cleaned = cleaned.replace(/^[\-–—]+\s*/g, "");
      cleaned = cleaned.replace(/\s+([,.;:!?])/g, "$1");
      return cleaned.trim();
    })
    .filter((line) => line.replace(/[^\p{L}\p{N}]/gu, "").length > 0)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isVideoUnavailableError(error: unknown): boolean {
  if (!error) return false;
  const name = (error as any)?.constructor?.name ?? "";
  const message = error instanceof Error ? error.message : String(error);
  return (
    name === "VideoUnavailable" ||
    name === "VideoUnplayable" ||
    message.includes("Video unavailable") ||
    message.includes("video unavailable") ||
    message.includes("This video is unavailable")
  );
}

function normalizeTranscriptError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;
    if (message.includes("Transcript is disabled")) {
      return "Sem legenda automática neste vídeo. Vou tentar os fallbacks locais.";
    }
    if (message.includes("Unable to find a transcript") || message.includes("No transcript found") || message.includes("No transcripts are available")) {
      return "Nenhuma transcrição automática encontrada. Vou tentar yt-dlp e Whisper local.";
    }
    if (isVideoUnavailableError(error)) {
      return "Vídeo indisponível ou removido no YouTube.";
    }
    return message;
  }
  return "Falha ao buscar transcrição.";
}

async function fetchTranscriptWithFallback(ytId: string): Promise<{ segments: Array<{ offset: number; text: string }> | null; videoUnavailable: boolean }> {
  const languageCandidates = ["pt", "pt-BR", "en", "en-US"];

  for (const lang of languageCandidates) {
    try {
      const segments = await YoutubeTranscript.fetchTranscript(ytId, { lang });
      if (segments?.length) {
        return { segments: segments.map(s => ({ offset: s.offset, text: s.text })), videoUnavailable: false };
      }
    } catch (error) {
      if (isVideoUnavailableError(error)) {
        return { segments: null, videoUnavailable: true };
      }
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("No transcripts are available") && !message.includes("Unable to find a transcript") && !message.includes("Transcript is disabled")) {
        continue;
      }
    }
  }

  try {
    const fallback = await YoutubeTranscript.fetchTranscript(ytId);
    if (fallback?.length) {
      return { segments: fallback.map(s => ({ offset: s.offset, text: s.text })), videoUnavailable: false };
    }
  } catch (error) {
    if (isVideoUnavailableError(error)) {
      return { segments: null, videoUnavailable: true };
    }
  }

  return { segments: null, videoUnavailable: false };
}

/**
 * Fallback nível 1.5: yt-caption-kit (alternativa ao youtube-transcript)
 */
async function fetchTranscriptWithYtCaptionKit(ytId: string): Promise<{ segments: Array<{ offset: number; text: string }> | null; videoUnavailable: boolean }> {
  try {
    const kit = new YtCaptionKit();
    const fetched = await kit.fetch(ytId, { languages: ["pt", "pt-BR", "en", "en-US", "en"] });
    if (fetched?.snippets?.length) {
      return {
        segments: fetched.snippets.map((s: any) => ({
          offset: typeof s.start === "number" ? s.start * 1000 : (s.offset ?? 0),
          text: s.text ?? "",
        })),
        videoUnavailable: false,
      };
    }
    return { segments: null, videoUnavailable: false };
  } catch (error) {
    const name = (error as any)?.constructor?.name ?? "";
    if (name === "VideoUnavailable" || name === "VideoUnplayable") {
      return { segments: null, videoUnavailable: true };
    }
    console.warn("⚠️ yt-caption-kit falhou:", error instanceof Error ? error.message : error);
    return { segments: null, videoUnavailable: false };
  }
}

/**
 * Fallback: Extract captions using yt-dlp locally
 */
async function extractCaptionsWithYtDlp(ytId: string): Promise<Array<{ offset: number; text: string }>> {
  try {
    const { execSync } = await import("child_process");
    const fs = await import("fs");
    const path = await import("path");

    const tempDir = path.join(process.cwd(), ".temp-captions");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const outputTemplate = path.join(tempDir, `${ytId}.%(ext)s`);
    const url = `https://www.youtube.com/watch?v=${ytId}`;

    // Try Portuguese first, then English
    for (const lang of ["pt", "en"]) {
      try {
        // Execute yt-dlp to download captions
        // --extractor-args youtube:player_client=mweb bypasses JS runtime requirement
        execSync(
          `yt-dlp --write-auto-sub --sub-lang ${lang} --skip-download --extractor-args "youtube:player_client=mweb" -o "${outputTemplate}" "${url}"`,
          { stdio: "ignore", timeout: 30000 },
        );

        // Look for VTT file
        const files = fs.readdirSync(tempDir);
        const vttFile = files.find((f: string) => f.startsWith(ytId) && f.endsWith(".vtt"));

        if (vttFile) {
          const vttPath = path.join(tempDir, vttFile);
          const buffer = fs.readFileSync(vttPath);
          let content = buffer.toString("utf-8");
          if (content.includes("\ufffd") || content.includes("\uFFFD")) {
            content = buffer.toString("latin1");
          }
          fs.unlinkSync(vttPath); // Clean up

          // Parse VTT format
          const segments: Array<{ offset: number; text: string }> = [];
          const lines = content.split("\n");

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // VTT timestamp format: 00:00:20.500 --> 00:00:22.000
            if (line.includes("-->")) {
              const timeMatch = line.match(/(\d{2}):(\d{2}):(\d{2})/);
              if (timeMatch && i + 1 < lines.length) {
                const [, h, m, s] = timeMatch;
                const offset = (parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s)) * 1000;
                let text = lines[i + 1].trim();
                // Remove formatting tags
                text = text.replace(/<[^>]+>/g, "").replace(/\n/g, " ");
                if (text) {
                  segments.push({ offset, text });
                }
              }
            }
          }

          if (segments.length > 0) {
            return segments;
          }
        }
      } catch (e) {
        // Try next language
        continue;
      }
    }

    return [];
  } catch (e) {
    console.warn("⚠️ yt-dlp caption extraction failed:", e instanceof Error ? e.message : e);
    return [];
  }
}

/**
 * Fallback nível 3: Transcrição local via faster-whisper (Python)
 * Chama o script scripts/whisper_transcribe.py como processo filho
 */
async function transcribeWithLocalWhisper(
  ytId: string,
): Promise<Array<{ offset: number; text: string }>> {
  try {
    const { execSync } = await import("child_process");
    const path = await import("path");

    const scriptPath = path.join(process.cwd(), "scripts", "whisper_transcribe.py");
    const url = `https://www.youtube.com/watch?v=${ytId}`;

    console.log(`🎙️ Iniciando transcrição Whisper local para ${ytId}...`);
    console.log(`⏳ Isso pode levar alguns minutos (download + transcrição CPU)...`);

    const output = execSync(
      `python "${scriptPath}" "${url}"`,
      { encoding: "utf-8", timeout: 300000 }, // 5 minutos
    ).trim();

    const result = JSON.parse(output) as {
      segments?: Array<{ offset: number; text: string }>;
      error?: string;
    };

    if (result.error) {
      console.warn(`⚠️ Whisper local retornou erro: ${result.error}`);
      return [];
    }

    if (result.segments && result.segments.length > 0) {
      console.log(`✅ Whisper local transcreveu ${result.segments.length} segmentos.`);
      return result.segments;
    }

    return [];
  } catch (e) {
    console.warn("⚠️ Whisper local falhou:", e instanceof Error ? e.message : e);
    return [];
  }
}

/**
 * Constrói o resultado final de transcrição a partir de segmentos (qualquer fonte)
 */
async function buildTranscriptResult(
  ytId: string,
  segments: Array<{ offset: number; text: string }>,
  source: string,
): Promise<FetchTranscriptResult> {
  const lines = segments.map((s) => {
    const ts = formatTimestamp(s.offset / 1000);
    const text = (s.text || "")
      .replace(/&amp;#39;/g, "'")
      .replace(/&amp;quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/\n/g, " ")
      .trim();
    return `[${ts}] ${text}`;
  });

  let videoTitle = "";
  try {
    const r = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`,
    );
    if (r.ok) {
      const j = (await r.json()) as { title?: string };
      videoTitle = j.title ?? "";
    }
  } catch {
    // ignore
  }

  const rawTranscript = lines.join("\n");
  const cleanedTranscript = cleanTranscriptText(rawTranscript);

  console.log(`✅ Transcrição via ${source}: ${lines.length} linhas`);
  return {
    transcript: cleanedTranscript,
    rawTranscript,
    videoTitle,
    videoId: ytId ?? "",
    source: "youtube",
  };
}

export const fetchTranscript = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<FetchTranscriptResult> => {
    const url = data.url.trim();
    const ytId = extractYouTubeId(url);

    if (!ytId) {
      const lower = url.toLowerCase();
      const detected =
        lower.includes("tiktok.com") ? "TikTok"
        : lower.includes("instagram.com") ? "Instagram"
        : lower.includes("linkedin.com") ? "LinkedIn"
        : lower.includes("x.com") || lower.includes("twitter.com") ? "X/Twitter"
        : "essa rede";
      return {
        transcript: "",
        rawTranscript: "",
        videoTitle: "",
        videoId: ytId ?? "",
        source: "youtube",
        error: `Por enquanto só suporto links do YouTube. Para ${detected}, baixe o áudio e cole a transcrição manualmente (ou peça pra eu integrar Whisper/AssemblyAI).`,
      };
    }

    try {
      // Fallback nível 1: youtube-transcript
      const { segments: ytSegments, videoUnavailable: ytUnavailable } = await fetchTranscriptWithFallback(ytId);

      if (ytUnavailable) {
        return {
          transcript: "",
          rawTranscript: "",
          videoTitle: "",
          videoId: ytId ?? "",
          source: "youtube",
          error: `Vídeo indisponível ou removido do YouTube (ID: ${ytId}).\n\nVerifique se o link está correto e se o vídeo é público.`,
        };
      }

      if (ytSegments && ytSegments.length > 0) {
        return buildTranscriptResult(ytId, ytSegments, "youtube-transcript");
      }

      // Fallback nível 1.5: yt-caption-kit
      console.log(`📥 [Fallback 1.5] Tentando yt-caption-kit para ${ytId}...`);
      const { segments: kitSegments, videoUnavailable: kitUnavailable } = await fetchTranscriptWithYtCaptionKit(ytId);

      if (kitUnavailable) {
        return {
          transcript: "",
          rawTranscript: "",
          videoTitle: "",
          videoId: ytId ?? "",
          source: "youtube",
          error: `Vídeo indisponível ou removido do YouTube (ID: ${ytId}).\n\nVerifique se o link está correto e se o vídeo é público.`,
        };
      }

      if (kitSegments && kitSegments.length > 0) {
        return buildTranscriptResult(ytId, kitSegments, "yt-caption-kit");
      }

      // Fallback nível 2: yt-dlp
      console.log(`📥 [Fallback 2] Tentando legendas automáticas com yt-dlp para ${ytId}...`);
      const ytdlpSegments = await extractCaptionsWithYtDlp(ytId);

      if (!ytdlpSegments || ytdlpSegments.length === 0) {
        // Fallback nível 3: Transcrição local via Whisper (Python)
        console.log(`🎙️ [Fallback 3] Nenhuma legenda encontrada. Tentando transcrição local com Whisper...`);
        const whisperSegments = await transcribeWithLocalWhisper(ytId);

        if (!whisperSegments || whisperSegments.length === 0) {
          return {
            transcript: "",
            rawTranscript: "",
            videoTitle: "",
            videoId: ytId ?? "",
            source: "youtube",
            error: `Não consegui puxar a transcrição automática deste vídeo.\n\nTentei 4 caminhos:\n1. youtube-transcript\n2. yt-caption-kit\n3. yt-dlp auto-subs\n4. Whisper local\n\nSe quiser seguir agora, cole a transcrição manualmente no campo abaixo ou use um vídeo com legendas ativadas.`,
          };
        }

        return buildTranscriptResult(ytId, whisperSegments, "Whisper local");
      }

      return buildTranscriptResult(ytId, ytdlpSegments, "yt-dlp");
    } catch (e) {
      console.error("fetchTranscript failed:", e);
      return {
        transcript: "",
        rawTranscript: "",
        videoTitle: "",
        videoId: ytId ?? "",
        source: "youtube",
        error: normalizeTranscriptError(e),
      };
    }
  });
