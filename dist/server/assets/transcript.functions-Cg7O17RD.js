import { c as createServerRpc } from "./createServerRpc-PUFeqlUR.js";
import { a as createServerFn } from "./server-BFBebUZd.js";
import { z } from "zod";
import { YoutubeTranscript } from "youtube-transcript";
import { YtCaptionKit } from "yt-caption-kit";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
const InputSchema = z.object({
  url: z.string().url().max(500)
});
function extractYouTubeId(url) {
  const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}
function formatTimestamp(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
function cleanTranscriptText(text) {
  return text.split("\n").map((line) => {
    let cleaned = line.trim();
    cleaned = cleaned.replace(/^\[(\d{1,2}:){1,2}\d{2}(?:\.\d+)?\]\s*/g, "");
    cleaned = cleaned.replace(/^\[(\d{1,2}:){1,2}\d{2}(?:\.\d+)?\]\s*/g, "");
    cleaned = cleaned.replace(/^\d{1,2}:\d{2}(?::\d{2})?\s*/g, "");
    cleaned = cleaned.replace(/\[(.*?)\]/g, (match, content) => {
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
  }).filter((line) => line.replace(/[^\p{L}\p{N}]/gu, "").length > 0).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
function isVideoUnavailableError(error) {
  if (!error) return false;
  const name = error?.constructor?.name ?? "";
  const message = error instanceof Error ? error.message : String(error);
  return name === "VideoUnavailable" || name === "VideoUnplayable" || message.includes("Video unavailable") || message.includes("video unavailable") || message.includes("This video is unavailable");
}
function normalizeTranscriptError(error) {
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
async function fetchTranscriptWithFallback(ytId) {
  const languageCandidates = ["pt", "pt-BR", "en", "en-US"];
  for (const lang of languageCandidates) {
    try {
      const segments = await YoutubeTranscript.fetchTranscript(ytId, {
        lang
      });
      if (segments?.length) {
        return {
          segments: segments.map((s) => ({
            offset: s.offset,
            text: s.text
          })),
          videoUnavailable: false
        };
      }
    } catch (error) {
      if (isVideoUnavailableError(error)) {
        return {
          segments: null,
          videoUnavailable: true
        };
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
      return {
        segments: fallback.map((s) => ({
          offset: s.offset,
          text: s.text
        })),
        videoUnavailable: false
      };
    }
  } catch (error) {
    if (isVideoUnavailableError(error)) {
      return {
        segments: null,
        videoUnavailable: true
      };
    }
  }
  return {
    segments: null,
    videoUnavailable: false
  };
}
async function fetchTranscriptWithYtCaptionKit(ytId) {
  try {
    const kit = new YtCaptionKit();
    const fetched = await kit.fetch(ytId, {
      languages: ["pt", "pt-BR", "en", "en-US", "en"]
    });
    if (fetched?.snippets?.length) {
      return {
        segments: fetched.snippets.map((s) => ({
          offset: typeof s.start === "number" ? s.start * 1e3 : s.offset ?? 0,
          text: s.text ?? ""
        })),
        videoUnavailable: false
      };
    }
    return {
      segments: null,
      videoUnavailable: false
    };
  } catch (error) {
    const name = error?.constructor?.name ?? "";
    if (name === "VideoUnavailable" || name === "VideoUnplayable") {
      return {
        segments: null,
        videoUnavailable: true
      };
    }
    console.warn("⚠️ yt-caption-kit falhou:", error instanceof Error ? error.message : error);
    return {
      segments: null,
      videoUnavailable: false
    };
  }
}
async function extractCaptionsWithYtDlp(ytId) {
  try {
    const {
      execSync
    } = await import("child_process");
    const fs = await import("fs");
    const path = await import("path");
    const tempDir = path.join(process.cwd(), ".temp-captions");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, {
        recursive: true
      });
    }
    const outputTemplate = path.join(tempDir, `${ytId}.%(ext)s`);
    const url = `https://www.youtube.com/watch?v=${ytId}`;
    for (const lang of ["pt", "en"]) {
      try {
        execSync(`yt-dlp --write-auto-sub --sub-lang ${lang} --skip-download --extractor-args "youtube:player_client=mweb" -o "${outputTemplate}" "${url}"`, {
          stdio: "ignore",
          timeout: 3e4
        });
        const files = fs.readdirSync(tempDir);
        const vttFile = files.find((f) => f.startsWith(ytId) && f.endsWith(".vtt"));
        if (vttFile) {
          const vttPath = path.join(tempDir, vttFile);
          const buffer = fs.readFileSync(vttPath);
          let content = buffer.toString("utf-8");
          if (content.includes("�") || content.includes("�")) {
            content = buffer.toString("latin1");
          }
          fs.unlinkSync(vttPath);
          const segments = [];
          const lines = content.split("\n");
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.includes("-->")) {
              const timeMatch = line.match(/(\d{2}):(\d{2}):(\d{2})/);
              if (timeMatch && i + 1 < lines.length) {
                const [, h, m, s] = timeMatch;
                const offset = (parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s)) * 1e3;
                let text = lines[i + 1].trim();
                text = text.replace(/<[^>]+>/g, "").replace(/\n/g, " ");
                if (text) {
                  segments.push({
                    offset,
                    text
                  });
                }
              }
            }
          }
          if (segments.length > 0) {
            return segments;
          }
        }
      } catch (e) {
        continue;
      }
    }
    return [];
  } catch (e) {
    console.warn("⚠️ yt-dlp caption extraction failed:", e instanceof Error ? e.message : e);
    return [];
  }
}
async function transcribeWithLocalWhisper(ytId) {
  try {
    const {
      execSync
    } = await import("child_process");
    const path = await import("path");
    const scriptPath = path.join(process.cwd(), "scripts", "whisper_transcribe.py");
    const url = `https://www.youtube.com/watch?v=${ytId}`;
    console.log(`🎙️ Iniciando transcrição Whisper local para ${ytId}...`);
    console.log(`⏳ Isso pode levar alguns minutos (download + transcrição CPU)...`);
    const output = execSync(
      `python "${scriptPath}" "${url}"`,
      {
        encoding: "utf-8",
        timeout: 3e5
      }
      // 5 minutos
    ).trim();
    const result = JSON.parse(output);
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
async function buildTranscriptResult(ytId, segments, source) {
  const lines = segments.map((s) => {
    const ts = formatTimestamp(s.offset / 1e3);
    const text = (s.text || "").replace(/&amp;#39;/g, "'").replace(/&amp;quot;/g, '"').replace(/&amp;/g, "&").replace(/\n/g, " ").trim();
    return `[${ts}] ${text}`;
  });
  let videoTitle = "";
  try {
    const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`);
    if (r.ok) {
      const j = await r.json();
      videoTitle = j.title ?? "";
    }
  } catch {
  }
  const rawTranscript = lines.join("\n");
  const cleanedTranscript = cleanTranscriptText(rawTranscript);
  console.log(`✅ Transcrição via ${source}: ${lines.length} linhas`);
  return {
    transcript: cleanedTranscript,
    rawTranscript,
    videoTitle,
    videoId: ytId ?? "",
    source: "youtube"
  };
}
const fetchTranscript_createServerFn_handler = createServerRpc({
  id: "fdc99a6ad5ce2c27d3d3aac698bb9a659bd505df5fc98b87522f16c5bbfd0715",
  name: "fetchTranscript",
  filename: "src/lib/transcript.functions.ts"
}, (opts) => fetchTranscript.__executeServer(opts));
const fetchTranscript = createServerFn({
  method: "POST"
}).inputValidator((data) => InputSchema.parse(data)).handler(fetchTranscript_createServerFn_handler, async ({
  data
}) => {
  const url = data.url.trim();
  const ytId = extractYouTubeId(url);
  if (!ytId) {
    const lower = url.toLowerCase();
    const detected = lower.includes("tiktok.com") ? "TikTok" : lower.includes("instagram.com") ? "Instagram" : lower.includes("linkedin.com") ? "LinkedIn" : lower.includes("x.com") || lower.includes("twitter.com") ? "X/Twitter" : "essa rede";
    return {
      transcript: "",
      rawTranscript: "",
      videoTitle: "",
      videoId: ytId ?? "",
      source: "youtube",
      error: `Por enquanto só suporto links do YouTube. Para ${detected}, baixe o áudio e cole a transcrição manualmente (ou peça pra eu integrar Whisper/AssemblyAI).`
    };
  }
  try {
    const {
      segments: ytSegments,
      videoUnavailable: ytUnavailable
    } = await fetchTranscriptWithFallback(ytId);
    if (ytUnavailable) {
      return {
        transcript: "",
        rawTranscript: "",
        videoTitle: "",
        videoId: ytId ?? "",
        source: "youtube",
        error: `Vídeo indisponível ou removido do YouTube (ID: ${ytId}).

Verifique se o link está correto e se o vídeo é público.`
      };
    }
    if (ytSegments && ytSegments.length > 0) {
      return buildTranscriptResult(ytId, ytSegments, "youtube-transcript");
    }
    console.log(`📥 [Fallback 1.5] Tentando yt-caption-kit para ${ytId}...`);
    const {
      segments: kitSegments,
      videoUnavailable: kitUnavailable
    } = await fetchTranscriptWithYtCaptionKit(ytId);
    if (kitUnavailable) {
      return {
        transcript: "",
        rawTranscript: "",
        videoTitle: "",
        videoId: ytId ?? "",
        source: "youtube",
        error: `Vídeo indisponível ou removido do YouTube (ID: ${ytId}).

Verifique se o link está correto e se o vídeo é público.`
      };
    }
    if (kitSegments && kitSegments.length > 0) {
      return buildTranscriptResult(ytId, kitSegments, "yt-caption-kit");
    }
    console.log(`📥 [Fallback 2] Tentando legendas automáticas com yt-dlp para ${ytId}...`);
    const ytdlpSegments = await extractCaptionsWithYtDlp(ytId);
    if (!ytdlpSegments || ytdlpSegments.length === 0) {
      console.log(`🎙️ [Fallback 3] Nenhuma legenda encontrada. Tentando transcrição local com Whisper...`);
      const whisperSegments = await transcribeWithLocalWhisper(ytId);
      if (!whisperSegments || whisperSegments.length === 0) {
        return {
          transcript: "",
          rawTranscript: "",
          videoTitle: "",
          videoId: ytId ?? "",
          source: "youtube",
          error: `Não consegui puxar a transcrição automática deste vídeo.

Tentei 4 caminhos:
1. youtube-transcript
2. yt-caption-kit
3. yt-dlp auto-subs
4. Whisper local

Se quiser seguir agora, cole a transcrição manualmente no campo abaixo ou use um vídeo com legendas ativadas.`
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
      error: normalizeTranscriptError(e)
    };
  }
});
export {
  fetchTranscript_createServerFn_handler
};
