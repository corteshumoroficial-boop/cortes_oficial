import { c as createServerRpc } from "./createServerRpc-PUFeqlUR.js";
import { a as createServerFn } from "./server-BFBebUZd.js";
import { z } from "zod";
import { execSync } from "child_process";
import { g as generateProfessionalThumbnail } from "./thumbnail-professional.functions-fL0MeMgu.js";
import { w as workerSupabase } from "./worker-supabase.server--3kYC13u.js";
import * as fs from "fs";
import * as path from "path";
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
import "./createSsrRpc-CkdUDiOt.js";
import "sharp";
import "@supabase/supabase-js";
const InputSchema = z.object({
  transcript: z.string().min(50).max(8e4),
  videoTitle: z.string().max(300).optional().default(""),
  videoPath: z.string().optional(),
  // 🎬 Caminho do vídeo para gerar thumbnails
  platform: z.string().max(50).optional().default("TikTok/Reels (9:16)"),
  tone: z.string().max(100).optional().default("High Energy")
});
const SYSTEM_PROMPT = `Você é um especialista em edição de vídeo viral e análise de retenção de audiência. Analisa transcrições de vídeos longos e identifica os melhores momentos para clipes curtos (TikTok, Reels, Shorts).

MUITO IMPORTANTE: TODA A SUA RESPOSTA, SEM EXCEÇÃO, DEVE SER ESCRITA EM PORTUGUÊS DO BRASIL (PT-BR). Se a transcrição fornecida estiver em outro idioma, você DEVE TRADUZIR os trechos extraídos e gerar os textos em PORTUGUÊS.

REGRA DE OURO PARA TEXTOS (TÍTULO E HOOK):
- NUNCA INVENTE textos, frases ou títulos genéricos!
- O campo 'title' e o campo 'hookQuote' devem ser compostos EXCLUSIVAMENTE por palavras reais faladas no vídeo. É terminantemente proibido inventar locais, contextos, fatos ou frases que não existem na transcrição. Baseie-se unicamente nas palavras realmente faladas.
- O campo 'title' DEVE SER uma frase curta e impactante extraída do vídeo (em PORTUGUÊS).
- O campo 'hookQuote' DEVE SER a frase exata falada nos primeiros segundos do clipe (traduzida/escrita em PORTUGUÊS).
- O campo 'justification', 'captionStyle' e 'brollSuggestion' DEVEM ser descrições escritas em PORTUGUÊS.
- REQUISITO CRÍTICO DE EXCLUSIVIDADE: Cada um dos 5 clipes DEVE ter timestamps de início ('startTimestamp') e fim ('endTimestamp') totalmente diferentes e não sobrepostos. Nunca use ou repita os mesmos timestamps para mais de um clipe.
- DIVERSIDADE DE CONTEXTO: O título ('title'), a frase do gancho ('hookQuote') e a justificativa ('justification') de cada clipe devem ser exclusivos e refletir exatamente o trecho falado daquele timestamp específico. Nunca repita o mesmo título ou texto entre os clipes.

CRITÉRIOS DE SELEÇÃO (Score de Viralização 0-100):
- HOOK: Frase de impacto / pergunta intrigante (cópia fiel do vídeo em PT-BR)
- CONTEXTO: Autoexplicativo, sem precisar do vídeo original
- VALOR: Lição, piada, opinião forte ou momento emocional
- FECHAMENTO: Cliffhanger ou conclusão satisfatória que incentive loop

Para cada clipe, forneça também direção visual (TUDO EM PORTUGUÊS):
- Estilo de legendas dinâmicas (palavras-chave destacadas)
- Sugestão de B-roll/emojis para conceitos abstratos

Retorne EXATAMENTE 5 clipes de 30-60s, ordenados por score (maior primeiro).`;
const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    clips: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Título viral curto e magnético EM PORTUGUÊS (max 80 chars)"
          },
          score: {
            type: "number",
            description: "Pontuação de viralidade 0-100"
          },
          startTimestamp: {
            type: "string",
            description: "Timestamp início no formato mm:ss ou hh:mm:ss"
          },
          endTimestamp: {
            type: "string",
            description: "Timestamp fim no formato mm:ss ou hh:mm:ss"
          },
          hookQuote: {
            type: "string",
            description: "A frase exata do hook falada no vídeo em português (primeiros 3s)"
          },
          triggers: {
            type: "array",
            items: {
              type: "string",
              enum: ["hook", "cliffhanger", "high_value", "controversy", "emotional", "humor"]
            }
          },
          justification: {
            type: "string",
            description: "Justificativa EM PORTUGUÊS de por que funciona como Short independente (1-2 frases)"
          }
        },
        required: ["title", "score", "startTimestamp", "endTimestamp", "hookQuote", "triggers", "justification"],
        additionalProperties: false
      }
    }
  },
  required: ["clips"],
  additionalProperties: false
};
function isHallucinated(text, transcript) {
  if (!text || !transcript) return true;
  const clean = (s) => s.toLowerCase().replace(/[.,\/#!$%\^\&\*;:{}=\-_`~()?"'’]/g, "").split(/\s+/).filter((w) => w.length > 2);
  const textWords = clean(text);
  const transcriptWords = new Set(clean(transcript));
  if (textWords.length === 0) return false;
  let missingCount = 0;
  for (const word of textWords) {
    if (!transcriptWords.has(word)) {
      missingCount++;
    }
  }
  return missingCount / textWords.length > 0.45;
}
function isTranscriptPortuguese(transcript) {
  if (!transcript) return false;
  const ptWords = ["o", "a", "que", "do", "da", "em", "um", "para", "com", "não", "uma", "os", "as", "se", "este", "como", "você", "ele", "ela"];
  const cleanTranscript = " " + transcript.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, "") + " ";
  return ptWords.some((w) => cleanTranscript.includes(" " + w + " "));
}
function parseTimestampToSeconds(ts) {
  const parts = ts.split(":").map((p) => parseInt(p, 10) || 0);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parts[0] || 0;
}
function cleanExtractedText(text) {
  return text.trim().replace(/^\[(\d{1,2}:){1,2}\d{2}(?:\.\d+)?\]\s*/g, "").replace(/^\d{1,2}:\d{2}(?::\d{2})?\s*/g, "").replace(/\[(.*?)\]/g, "").replace(/(?:->|=>|→|<-|←|↔|<->|\u25B6|\u25C0|\u25AA|\u25CF|\u2022|\u2023|\u25E6)/g, " ").replace(/[^\p{L}\p{N}\s,.;:!?"'()-]/gu, " ").replace(/\s{2,}/g, " ").replace(/\s+([,.;:!?])/g, "$1").trim();
}
function extractTranscriptExcerpt(transcript, startTs, endTs) {
  const startSec = parseTimestampToSeconds(startTs);
  const endSec = parseTimestampToSeconds(endTs);
  const lines = transcript.split("\n");
  const matchingLines = [];
  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;
    const match = cleanLine.match(/^\[([\d:]+)\]/);
    if (match) {
      const lineSec = parseTimestampToSeconds(match[1]);
      if (lineSec >= startSec && lineSec <= endSec) {
        const cleanedLine = cleanExtractedText(cleanLine.replace(/^\[[\d:]+\]\s*/, ""));
        if (cleanedLine) {
          matchingLines.push(cleanedLine);
        }
      }
    }
  }
  if (matchingLines.length > 0) {
    return matchingLines.join(" ").slice(0, 280);
  }
  const fallback = cleanExtractedText(transcript);
  if (fallback) {
    return fallback.split(" ").slice(0, 35).join(" ") + "...";
  }
  return "Trecho do vídeo";
}
function secondsToTimestamp(s) {
  const sec = Math.max(0, Math.floor(s));
  const h = Math.floor(sec / 3600);
  const m = Math.floor(sec % 3600 / 60);
  const ss = sec % 60;
  if (h > 0) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}
function scoreSegment(text) {
  const lower = text.toLowerCase();
  let score = 50;
  const triggers = [];
  const hookKeywords = ["segredo", "revelado", "erro", "falha", "perigo", "cuidado", "nunca", "sempre", "descobri", "método", "passo a passo", "secreto", "mentira", "verdade", "mitos", "como", "por que", "por quê", "sabe o que", "presta atenção", "olha isso"];
  const highValueKeywords = ["dinheiro", "rico", "milhão", "milhões", "faturamento", "negócio", "empresa", "sucesso", "liberdade", "carreira", "lucro", "vendas", "vender", "dólar", "dólares", "investir", "investimento", "resultado", "crescimento", "escala"];
  const emotionalKeywords = ["odiar", "amar", "triste", "chorar", "revoltar", "absurdo", "inacreditável", "surpresa", "assustador", "medo", "dor", "sofrer", "sonho", "decepção", "emocionante", "orgulho"];
  const controversyKeywords = ["polêmica", "mentiroso", "roubo", "crime", "engano", "farsa", "errado", "contra", "mentiram", "enganado", "manipulação", "absurdo", "ninguém fala", "verdade nua", "detesto"];
  const humorKeywords = ["engraçado", "rir", "piada", "risada", "comédia", "divertido", "kkk", "hahaha", "zoeira"];
  let hasHook = false;
  let hasHighValue = false;
  let hasEmotional = false;
  let hasControversy = false;
  let hasHumor = false;
  for (const kw of hookKeywords) {
    if (lower.includes(kw)) {
      hasHook = true;
      break;
    }
  }
  for (const kw of highValueKeywords) {
    if (lower.includes(kw)) {
      hasHighValue = true;
      break;
    }
  }
  for (const kw of emotionalKeywords) {
    if (lower.includes(kw)) {
      hasEmotional = true;
      break;
    }
  }
  for (const kw of controversyKeywords) {
    if (lower.includes(kw)) {
      hasControversy = true;
      break;
    }
  }
  for (const kw of humorKeywords) {
    if (lower.includes(kw)) {
      hasHumor = true;
      break;
    }
  }
  if (hasHook) {
    score += 25;
    triggers.push("hook");
  }
  if (hasHighValue) {
    score += 20;
    triggers.push("high_value");
  }
  if (hasEmotional) {
    score += 15;
    triggers.push("emotional");
  }
  if (hasControversy) {
    score += 20;
    triggers.push("controversy");
  }
  if (hasHumor) {
    score += 15;
    triggers.push("humor");
  }
  if (lower.includes("?")) {
    score += 15;
    if (!triggers.includes("cliffhanger")) {
      triggers.push("cliffhanger");
    }
  }
  if (/[!]/.test(text)) {
    score += 8;
  }
  if (/\b(você|ninguém|todo mundo|sempre|nunca|realmente|de verdade|na prática|isso aqui)\b/i.test(text)) {
    score += 10;
    if (!triggers.includes("hook")) {
      triggers.push("hook");
    }
  }
  if (/\b(porque|por isso|então|mas|só que|porém)\b/i.test(text)) {
    score += 8;
  }
  score = Math.min(98, score);
  if (triggers.length === 0) {
    triggers.push("hook");
  }
  return {
    score,
    triggers
  };
}
function buildEngagingTitleAndHook(text, triggers, startTimestamp) {
  const words = text.split(/\s+/).filter(Boolean);
  const plain = words.slice(0, 10).join(" ").replace(/[\[\]{}()]/g, "");
  const lower = text.toLowerCase();
  let title = plain.split(" ").slice(0, 6).join(" ").toUpperCase();
  let hookQuote = words.slice(0, 14).join(" ");
  if (triggers.includes("controversy")) {
    title = `A VERDADE SOBRE ${words.slice(0, 4).join(" ")}`.toUpperCase();
  } else if (triggers.includes("high_value")) {
    title = `O ERRO QUE ${words.slice(0, 4).join(" ")}`.toUpperCase();
  } else if (triggers.includes("emotional")) {
    title = words.slice(0, 7).join(" ").toUpperCase();
  } else if (triggers.includes("humor")) {
    title = `OLHA ISSO AQUI: ${words.slice(0, 3).join(" ")}`.toUpperCase();
  } else if (triggers.includes("cliffhanger")) {
    title = `${words.slice(0, 4).join(" ")}... O FINAL É PIOR`.toUpperCase();
  } else if (triggers.includes("hook")) {
    title = words.slice(0, 5).join(" ").toUpperCase();
  }
  if (!title || title.length < 8) {
    title = `CORTE VIRAL EM ${startTimestamp}`;
  }
  if (!hookQuote || hookQuote.length < 18) {
    hookQuote = words.slice(0, 18).join(" ");
  }
  if (!hookQuote) {
    hookQuote = text || "Trecho com alto potencial viral...";
  }
  if (lower.includes("?")) {
    hookQuote = hookQuote.endsWith("?") ? hookQuote : `${hookQuote}?`;
  }
  return {
    title: title.slice(0, 80),
    hookQuote: hookQuote.slice(0, 140)
  };
}
function quickAnalyzeTranscript(transcript, videoTitle) {
  const lines = transcript.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const segments = [];
  let currentSec = 0;
  let hasAnyTimestamps = false;
  const tsRegex = /^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?/;
  for (const line of lines) {
    if (tsRegex.test(line)) {
      hasAnyTimestamps = true;
      break;
    }
  }
  let accumulatedWords = 0;
  for (const line of lines) {
    const tsMatch = line.match(tsRegex);
    let text = line;
    if (tsMatch) {
      currentSec = parseTimestampToSeconds(tsMatch[1]);
      text = line.replace(tsRegex, "").trim();
    } else {
      if (hasAnyTimestamps) {
        const prevWords = segments.length > 0 ? segments[segments.length - 1].wordCount : 0;
        currentSec += prevWords * 0.4;
      } else {
        currentSec = accumulatedWords * 0.4;
      }
    }
    const cleanedText = cleanExtractedText(text);
    if (!cleanedText) continue;
    const words = cleanedText.split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;
    segments.push({
      text: cleanedText,
      startSec: Math.round(currentSec),
      wordCount: words.length
    });
    accumulatedWords += words.length;
  }
  if (segments.length === 0) {
    const mockClips = [];
    for (let i = 0; i < 5; i++) {
      const id = `clip_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
      mockClips.push({
        id,
        title: `CORTADO AUTOMATICAMENTE ${i + 1}`,
        score: 75 - i * 4,
        startTimestamp: secondsToTimestamp(i * 50),
        endTimestamp: secondsToTimestamp(i * 50 + 35),
        durationSeconds: 35,
        hookQuote: "Este corte foi gerado automaticamente baseando-se na ordem temporal.",
        triggers: ["hook"],
        justification: "Trecho do vídeo curto com alta densidade de conteúdo.",
        captionStyle: "Legendas dinâmicas com palavras-chave destacadas",
        brollSuggestion: "Corte rápido, zoom sutil",
        transcriptExcerpt: "Segmento do vídeo longo."
      });
    }
    return {
      clips: mockClips
    };
  }
  const scoredSegments = segments.map((seg, idx) => {
    const {
      score,
      triggers
    } = scoreSegment(seg.text);
    return {
      segment: seg,
      index: idx,
      score,
      triggers
    };
  });
  const selected = [];
  if (scoredSegments.length <= 5) {
    selected.push(...scoredSegments);
  } else {
    const zoneSize = Math.floor(scoredSegments.length / 5);
    for (let i = 0; i < 5; i++) {
      const startIdx = i * zoneSize;
      const endIdx = i === 4 ? scoredSegments.length : (i + 1) * zoneSize;
      const zoneItems = scoredSegments.slice(startIdx, endIdx);
      if (zoneItems.length > 0) {
        let best = zoneItems[0];
        for (const item of zoneItems) {
          if (item.score > best.score) {
            best = item;
          } else if (item.score === best.score && item.segment.wordCount > best.segment.wordCount) {
            best = item;
          }
        }
        selected.push(best);
      }
    }
  }
  while (selected.length < 5 && scoredSegments.length > 0) {
    const remaining = scoredSegments.filter((s) => !selected.some((sel) => sel.index === s.index));
    if (remaining.length === 0) break;
    selected.push(remaining[0]);
  }
  selected.sort((a, b) => a.segment.startSec - b.segment.startSec);
  const candidates = selected.slice(0, 5).map((item) => {
    const seg = item.segment;
    const triggers = item.triggers;
    const score = item.score;
    const id = `clip_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    let currentClipText = seg.text;
    let currentEndSec = seg.startSec + seg.wordCount * 0.4;
    for (let j = item.index + 1; j < segments.length; j++) {
      const nextSeg = segments[j];
      const nextEndSec = nextSeg.startSec + nextSeg.wordCount * 0.4;
      if (nextEndSec - seg.startSec > 45) {
        break;
      }
      currentClipText += " " + nextSeg.text;
      currentEndSec = nextEndSec;
    }
    const duration = Math.max(30, Math.round(currentEndSec - seg.startSec));
    const startTimestamp = secondsToTimestamp(seg.startSec);
    const endTimestamp = secondsToTimestamp(seg.startSec + duration);
    const engaging = buildEngagingTitleAndHook(seg.text, triggers, startTimestamp);
    const title = engaging.title;
    const hookQuote = engaging.hookQuote;
    const justification = `Trecho selecionado cronologicamente no minuto ${startTimestamp} com gatilhos de engajamento baseados em (${triggers.join(", ")}). Mantém retenção por ${duration} segundos.`;
    return {
      id,
      title,
      score,
      startTimestamp,
      endTimestamp,
      durationSeconds: duration,
      hookQuote,
      triggers,
      justification,
      captionStyle: "Legendas dinâmicas com palavras-chave destacadas",
      brollSuggestion: "Corte rápido, zoom sutil e emojis de suporte",
      transcriptExcerpt: currentClipText.slice(0, 280)
    };
  });
  return {
    clips: candidates.sort((a, b) => b.score - a.score)
  };
}
function normalizeClipRange(clip) {
  const start = parseTimestampToSeconds(clip.startTimestamp);
  const end = parseTimestampToSeconds(clip.endTimestamp);
  return {
    start: Math.max(0, start),
    end: Math.max(Math.max(0, start + 1), end)
  };
}
function clipLooksRepeated(clip, other) {
  const a = normalizeClipRange(clip);
  const b = normalizeClipRange(other);
  const overlap = Math.max(0, Math.min(a.end, b.end) - Math.max(a.start, b.start));
  const sameRange = Math.abs(a.start - b.start) <= 4 && Math.abs(a.end - b.end) <= 4;
  const normalizeText = (text) => text.toLowerCase().replace(/[\p{P}\p{S}]+/gu, " ").replace(/\s+/g, " ").trim();
  const sameTitle = normalizeText(clip.title) === normalizeText(other.title) && normalizeText(clip.title).length > 0;
  const sameHook = normalizeText(clip.hookQuote) === normalizeText(other.hookQuote) && normalizeText(clip.hookQuote).length > 0;
  return overlap >= 6 || sameRange || sameTitle || sameHook;
}
function ensureDistinctClipSet(clips, transcript, videoTitle) {
  const limited = clips.slice(0, 5);
  if (limited.length <= 1) {
    return limited;
  }
  const fallback = quickAnalyzeTranscript(transcript).clips;
  const selected = [];
  for (const clip of limited) {
    const repeated = selected.some((chosen) => clipLooksRepeated(clip, chosen));
    if (!repeated) {
      selected.push(clip);
      continue;
    }
    const replacement = fallback.find((candidate) => !selected.some((chosen) => clipLooksRepeated(candidate, chosen)));
    if (replacement) {
      selected.push(replacement);
    } else {
      selected.push(clip);
    }
  }
  const unique = [];
  for (const clip of selected) {
    if (!unique.some((chosen) => clipLooksRepeated(clip, chosen))) {
      unique.push(clip);
    }
  }
  while (unique.length < 5 && fallback.length > unique.length) {
    const candidate = fallback[unique.length];
    if (!unique.some((chosen) => clipLooksRepeated(candidate, chosen))) {
      unique.push(candidate);
    } else {
      const nextCandidate = fallback.find((item) => !unique.some((chosen) => clipLooksRepeated(item, chosen)));
      if (!nextCandidate) break;
      unique.push(nextCandidate);
    }
  }
  return unique.slice(0, 5).sort((a, b) => b.score - a.score);
}
function repairTruncatedOllamaJson(rawJson) {
  console.warn("⚠️ JSON truncado detectado. Tentando recuperar clips completos...");
  const clipsStart = rawJson.indexOf('"clips"');
  if (clipsStart === -1) {
    throw new Error("Campo 'clips' não encontrado no JSON truncado");
  }
  const arrayStart = rawJson.indexOf("[", clipsStart);
  if (arrayStart === -1) {
    throw new Error("Array de clips não encontrado no JSON truncado");
  }
  const arrayContent = rawJson.slice(arrayStart + 1);
  const completeClips = [];
  let depth = 0;
  let objectStart = -1;
  let inString = false;
  let escaped = false;
  for (let i = 0; i < arrayContent.length; i++) {
    const char = arrayContent[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (char === "{") {
      if (depth === 0) objectStart = i;
      depth++;
    } else if (char === "}") {
      depth--;
      if (depth === 0 && objectStart !== -1) {
        const objectStr = arrayContent.slice(objectStart, i + 1);
        try {
          const obj = JSON.parse(objectStr);
          if (obj.title && obj.startTimestamp && obj.endTimestamp && obj.triggers) {
            completeClips.push(obj);
          }
        } catch {
        }
        objectStart = -1;
      }
    } else if (char === "]" && depth === 0) {
      break;
    }
  }
  if (completeClips.length === 0) {
    throw new Error("Nenhum clip completo encontrado no JSON truncado");
  }
  console.log(`✅ Recuperados ${completeClips.length} clips completos do JSON truncado.`);
  return {
    clips: completeClips
  };
}
function getEnvVariable(key, defaultValue) {
  try {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const cleanLine = line.trim();
        if (cleanLine.startsWith("#") || !cleanLine) continue;
        const index = cleanLine.indexOf("=");
        if (index !== -1) {
          const varKey = cleanLine.substring(0, index).trim();
          if (varKey === key) {
            let val = cleanLine.substring(index + 1).trim();
            if (val.startsWith('"') && val.endsWith('"')) {
              val = val.slice(1, -1);
            }
            if (val.startsWith("'") && val.endsWith("'")) {
              val = val.slice(1, -1);
            }
            return val;
          }
        }
      }
    }
  } catch (err) {
    console.error("Failed to read .env file:", err);
  }
  return process.env[key] || defaultValue;
}
const analyzeTranscript_createServerFn_handler = createServerRpc({
  id: "37dd1fa2551a652cc263b8aa2522ab438df59bd7c96d35d7e7b09ee85406f3f4",
  name: "analyzeTranscript",
  filename: "src/lib/clips.functions.ts"
}, (opts) => analyzeTranscript.__executeServer(opts));
const analyzeTranscript = createServerFn({
  method: "POST"
}).inputValidator((data) => InputSchema.parse(data)).handler(analyzeTranscript_createServerFn_handler, async ({
  data
}) => {
  const lovableKey = getEnvVariable("LOVABLE_API_KEY", "").trim();
  const openAiKey = getEnvVariable("OPENAI_API_KEY", "").trim();
  const ollamaUrl = getEnvVariable("OLLAMA_BASE_URL", "http://127.0.0.1:11434").trim().replace("localhost", "127.0.0.1");
  const ollamaModel = getEnvVariable("OLLAMA_MODEL", "llama3.2:1b").trim();
  console.log(`[OLLAMA] Usando modelo: "${ollamaModel}" no endpoint: "${ollamaUrl}"`);
  const isLovableValid = lovableKey && !lovableKey.includes("COLOQUE_SUA_CHAVE_AQUI") && !lovableKey.includes("SEU_TOKEN_AQUI");
  const isOpenAiValid = openAiKey && !openAiKey.includes("COLOQUE_SUA_CHAVE_AQUI") && !openAiKey.includes("SEU_TOKEN_AQUI");
  const aiConfig = isLovableValid ? {
    provider: "lovable",
    apiKey: lovableKey,
    endpoint: "https://ai.gateway.lovable.dev/v1/chat/completions",
    model: "google/gemini-2.5-flash"
  } : isOpenAiValid ? {
    provider: "openai",
    apiKey: openAiKey,
    endpoint: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini"
  } : {
    provider: "ollama",
    endpoint: `${ollamaUrl}/api/chat`,
    model: ollamaModel
  };
  try {
    const fastModeEnv = getEnvVariable("ANALYZE_FAST_MODE", "false").toLowerCase() === "true";
    const useFastByDefault = !isOpenAiValid && !isLovableValid && aiConfig.provider === "ollama" && ollamaModel.includes("1b");
    if (fastModeEnv || useFastByDefault) {
      console.log("⚡ ANALYZE FAST MODE active - returning quick heuristic results");
      const quick = quickAnalyzeTranscript(data.transcript, data.videoTitle || "");
      if (data.videoPath) {
        console.log("📸 Fast analyze with videoPath: generating thumbnails in quick mode...");
        const allTriggerTypes = ["humor", "controversy", "emotional", "hook", "high_value", "cliffhanger"];
        const TRIGGER_BG_MAP = {
          humor: "vibrant_gradient",
          controversy: "dark_gradient",
          emotional: "city_night",
          hook: "dark_gradient",
          high_value: "vibrant_gradient",
          cliffhanger: "abstract"
        };
        let resolvedStreamUrl;
        const isYouTube = data.videoPath.includes("youtube.com") || data.videoPath.includes("youtu.be");
        if (isYouTube) {
          try {
            console.log(`⚡ Resolving quick stream URL for thumbnails: ${data.videoPath}`);
            const ytdlpCmd = `yt-dlp -g -f "bestvideo[ext=mp4]/best[ext=mp4]/best" "${data.videoPath}"`;
            const resolved = execSync(ytdlpCmd, {
              encoding: "utf-8",
              timeout: 25e3
            }).trim().split("\n")[0];
            if (resolved && resolved.startsWith("http")) {
              resolvedStreamUrl = resolved;
              console.log(`✅ Quick stream URL resolved successfully.`);
            }
          } catch (ytErr) {
            console.warn(`⚠️ Failed to resolve quick stream URL for thumbnails.`, ytErr);
          }
        }
        const quickClipsWithThumbs = [];
        for (let index = 0; index < quick.clips.length; index++) {
          const clip = quick.clips[index];
          try {
            const clipRealTrigger = clip.triggers && clip.triggers[0] ? clip.triggers[0] : allTriggerTypes[index % allTriggerTypes.length];
            const selectedTrigger = allTriggerTypes.includes(clipRealTrigger) ? clipRealTrigger : allTriggerTypes[index % allTriggerTypes.length];
            const timeParts = clip.startTimestamp.split(":").reverse();
            let startSeconds = 0;
            for (let i = 0; i < timeParts.length; i++) {
              startSeconds += (parseInt(timeParts[i], 10) || 0) * Math.pow(60, i);
            }
            const durationSec = clip.durationSeconds || 30;
            const EXTRACT_OFFSETS = [2, Math.floor(durationSec * 0.4), Math.floor(durationSec * 0.75)];
            const extractAtSeconds = startSeconds + EXTRACT_OFFSETS[index % EXTRACT_OFFSETS.length];
            const backgroundTemplate = TRIGGER_BG_MAP[selectedTrigger] ?? "dark_gradient";
            const result = await generateProfessionalThumbnail({
              data: {
                videoPath: data.videoPath,
                resolvedStreamUrl,
                clipTitle: clip.title,
                clipHook: clip.hookQuote,
                triggerType: selectedTrigger,
                extractAtSeconds,
                personPositions: ["center"],
                backgroundTemplate,
                compactLayout: (clip.durationSeconds || 0) < 30,
                useAdvancedEffects: true,
                clipId: clip.id
              }
            });
            quickClipsWithThumbs.push({
              ...clip,
              thumbnailDataUrl: result.success ? result.thumbnailDataUrl : void 0
            });
          } catch (error) {
            console.warn(`⚠️ Fast thumbnail generation failed for clip "${clip.title}":`, error);
            quickClipsWithThumbs.push(clip);
          }
        }
        return {
          clips: ensureDistinctClipSet(quickClipsWithThumbs, data.transcript, data.videoTitle || "")
        };
      }
      return {
        clips: ensureDistinctClipSet(quick.clips, data.transcript, data.videoTitle || "")
      };
    }
  } catch (err) {
    console.warn("Fast analyze mode check failed:", err);
  }
  if (!aiConfig) {
    return {
      clips: [],
      error: "Nenhuma chave de IA válida está configurada. Defina LOVABLE_API_KEY, OPENAI_API_KEY ou configure Ollama no arquivo .env antes de analisar o conteúdo."
    };
  }
  let positiveExamplesPrompt = "";
  try {
    const admin = workerSupabase;
    const {
      data: feedbackExamples
    } = await admin.from("clip_feedback").select("*").eq("rating", 1).order("created_at", {
      ascending: false
    }).limit(5);
    if (feedbackExamples && feedbackExamples.length > 0) {
      positiveExamplesPrompt = `

EXEMPLOS DE REFERÊNCIA (Esses clipes foram altamente aprovados/corrigidos pelo usuário no passado. Siga rigorosamente este estilo de título e hook):
` + feedbackExamples.map((ex, idx) => `
Exemplo ${idx + 1}:
- Trecho da transcrição: "${ex.transcript_excerpt}"
- Título aprovado: "${ex.approved_title}"
- Hook/Gancho aprovado: "${ex.approved_hook}"
`).join("\n");
    }
  } catch (dbError) {
    console.warn("⚠️ Não foi possível recuperar feedbacks do Supabase (tabela clip_feedback pode não existir):", dbError);
  }
  const userPrompt = `VÍDEO: "${data.videoTitle || "Sem título"}"
PLATAFORMA ALVO: ${data.platform}
TOM: ${data.tone}

TRANSCRIÇÃO:
${data.transcript}

ATENÇÃO IMPORTANTE PARA DIVERSIDADE E ENGAJAMENTO DOS CORTES:
1. Cada um dos 5 clipes DEVE iniciar e terminar em timestamps totalmente diferentes e espalhados ao longo de todo o vídeo. Não concentre os cortes todos no mesmo trecho (ex: todos no início ou no meio).
2. Não copie os timestamps do exemplo do esquema! Encontre e calcule os timestamps reais baseados na transcrição fornecida.
3. Foque em trechos que geram alto engajamento, como: revelações surpreendentes, opiniões fortes, momentos engraçados, dados curiosos ou ganchos intrigantes.
4. O campo 'hookQuote' DEVE ser a frase exata falada naquele trecho específico da transcrição.

Extraia os 5 melhores clipes virais (30-60s) com timestamps reais, score de viralidade e justificativa.`;
  try {
    if (aiConfig.provider === "ollama") {
      const SCHEMA_EXAMPLE = {
        clips: [{
          title: "TÍTULO DO PRIMEIRO CLIPE AQUI",
          score: 95,
          startTimestamp: "00:10",
          endTimestamp: "00:40",
          hookQuote: "Frase exata falada no início do clipe 1",
          triggers: ["hook", "high_value"],
          justification: "Explicação em português do motivo desse trecho ser viral."
        }, {
          title: "TÍTULO DO SEGUNDO CLIPE AQUI",
          score: 90,
          startTimestamp: "01:05",
          endTimestamp: "01:35",
          hookQuote: "Frase exata falada no início do clipe 2",
          triggers: ["high_value", "cliffhanger"],
          justification: "Explicação em português do motivo desse trecho ser viral."
        }, {
          title: "TÍTULO DO TERCEIRO CLIPE AQUI",
          score: 85,
          startTimestamp: "02:15",
          endTimestamp: "02:50",
          hookQuote: "Frase exata falada no início do clipe 3",
          triggers: ["hook", "controversy"],
          justification: "Explicação em português do motivo desse trecho ser viral."
        }, {
          title: "TÍTULO DO QUARTO CLIPE AQUI",
          score: 80,
          startTimestamp: "03:40",
          endTimestamp: "04:15",
          hookQuote: "Frase exata falada no início do clipe 4",
          triggers: ["emotional", "high_value"],
          justification: "Explicação em português do motivo desse trecho ser viral."
        }, {
          title: "TÍTULO DO QUINTO CLIPE AQUI",
          score: 75,
          startTimestamp: "04:50",
          endTimestamp: "05:25",
          hookQuote: "Frase exata falada no início do clipe 5",
          triggers: ["high_value", "cliffhanger"],
          justification: "Explicação em português do motivo desse trecho ser viral."
        }]
      };
      let response2;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6e5);
        response2 = await fetch(aiConfig.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: aiConfig.model,
            options: {
              num_predict: 4096,
              // ⚡ Garante saída completa — evita JSON truncado
              temperature: 0.3
              // Mais determinístico para JSON estruturado
            },
            messages: [{
              role: "system",
              content: SYSTEM_PROMPT + (positiveExamplesPrompt ? `

${positiveExamplesPrompt}` : "")
            }, {
              role: "user",
              content: `${userPrompt}

Responda APENAS com JSON válido. Use exatamente este formato (substitua pelos dados reais do vídeo):
${JSON.stringify(SCHEMA_EXAMPLE, null, 2)}`
            }],
            stream: false,
            format: "json"
            // Force JSON mode in Ollama
          })
        });
        clearTimeout(timeout);
      } catch (err) {
        console.error("Ollama connection error:", err.message);
        const isTimeout = err.name === "AbortError" || err.message?.toLowerCase().includes("aborted");
        const errorMsg = isTimeout ? `O processamento do Ollama excedeu o tempo limite (10 minutos).

Como o Ollama roda localmente no seu computador, analisar transcrições longas sem uma placa de vídeo dedicada (GPU) ativa pode ser extremamente lento e travar a execução.

Solução recomendada:
Configure uma chave de IA no arquivo .env (ex: OPENAI_API_KEY ou LOVABLE_API_KEY) para obter os resultados em poucos segundos de forma estável.` : `Não consegui conectar ao Ollama em ${aiConfig.endpoint}.

Detalhes: ${err.message}

Solução: Instale Ollama (https://ollama.ai) e rode:
  ollama pull ${aiConfig.model}
  ollama serve

Ou configure uma chave de IA no .env:
  OPENAI_API_KEY=sk-...
  LOVABLE_API_KEY=seu-token`;
        return {
          clips: [],
          error: errorMsg
        };
      }
      if (!response2.ok) {
        const statusText = `Ollama retornou status ${response2.status}`;
        const text = await response2.text().catch(() => "");
        console.error("Ollama error:", response2.status, text);
        return {
          clips: [],
          error: `${statusText}.

Solução: Instale Ollama (https://ollama.ai) e rode:
  ollama pull ${aiConfig.model}
  ollama serve

Ou configure uma chave de IA no .env:
  OPENAI_API_KEY=sk-...
  LOVABLE_API_KEY=seu-token`
        };
      }
      const json2 = await response2.json();
      const content = json2.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          clips: [],
          error: "Ollama retornou resposta inválida (JSON não encontrado). Tente novamente."
        };
      }
      let parsed2;
      try {
        const rawJson = jsonMatch[0];
        const cleanedJson = rawJson.replace(/,\s*([\]}])/g, "$1").trim();
        try {
          parsed2 = JSON.parse(cleanedJson);
        } catch {
          parsed2 = repairTruncatedOllamaJson(rawJson);
        }
      } catch (parseError) {
        console.error("Failed to parse Ollama JSON response:", parseError);
        return {
          clips: [],
          error: `O modelo Ollama gerou JSON incompleto. Tente um modelo maior (ex: llama3.2:3b) ou use OpenAI/Lovable API.

Detalhes: ${parseError.message}`
        };
      }
      if (!parsed2.clips || !Array.isArray(parsed2.clips)) {
        return {
          clips: [],
          error: "O campo principal 'clips' não foi encontrado na resposta do Ollama."
        };
      }
      const sanitizedClips2 = parsed2.clips.map((clipObj) => {
        const id = clipObj.id || `clip_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
        let title = String(clipObj.title || clipObj.titulo || "");
        let hookQuote = String(clipObj.hookQuote || clipObj.gancho || clipObj.hook || "");
        let justification = String(clipObj.justification || clipObj.justificativa || "Trecho com alto potencial viral.");
        let startTimestamp = String(clipObj.startTimestamp || clipObj.timestamp_inicio || clipObj.timestamp || "00:00");
        let endTimestamp = String(clipObj.endTimestamp || clipObj.timestamp_fim || "00:00");
        const startSec = parseTimestampToSeconds(startTimestamp);
        const endSec = parseTimestampToSeconds(endTimestamp);
        let durationSeconds = endSec - startSec;
        if (durationSeconds <= 0 || isNaN(durationSeconds)) {
          durationSeconds = 30;
        }
        const excerpt = extractTranscriptExcerpt(data.transcript, startTimestamp, endTimestamp);
        const captionStyle = "Legendas dinâmicas com palavras-chave destacadas";
        const brollSuggestion = "Corte rápido, zoom sutil e emojis de suporte";
        const badWords = ["[", "]", "título", "viral", "magnético", "coloque", "exemplo", "maior segredo", "escreva o", "em português"];
        const isPt = isTranscriptPortuguese(data.transcript);
        const isTitleBad = !title || badWords.some((w) => title.toLowerCase().includes(w)) || isPt && isHallucinated(title, excerpt);
        const isHookBad = !hookQuote || badWords.some((w) => hookQuote.toLowerCase().includes(w)) || isPt && isHallucinated(hookQuote, excerpt);
        if (!justification || justification.includes("[") || justification.toLowerCase().includes("escreva")) {
          justification = "Trecho com forte retenção inicial e valor entregue no final.";
        }
        if (isTitleBad || isHookBad) {
          const engaging = buildEngagingTitleAndHook(excerpt, clipObj.triggers || ["hook"], startTimestamp);
          if (isTitleBad) {
            title = engaging.title;
          }
          if (isHookBad) {
            hookQuote = engaging.hookQuote;
          }
        }
        if (!title) title = "CORTE VIRAL";
        if (!hookQuote) hookQuote = "Assista até o final...";
        return {
          id,
          title,
          score: Number(clipObj.score || clipObj.pontuacao || 50),
          startTimestamp,
          endTimestamp,
          durationSeconds,
          hookQuote,
          triggers: (Array.isArray(clipObj.triggers) ? clipObj.triggers : Array.isArray(clipObj.gatilhos) ? clipObj.gatilhos : ["hook"]).map((t) => {
            const str = String(t).toLowerCase();
            if (["hook", "cliffhanger", "high_value", "controversy", "emotional", "humor"].includes(str)) {
              return str;
            }
            if (str === "gancho" || str === "hook") return "hook";
            if (str === "suspense" || str === "cliffhanger") return "cliffhanger";
            if (str === "alto_valor" || str === "valor" || str === "high_value") return "high_value";
            if (str === "controversia" || str === "polemica" || str === "controversy") return "controversy";
            if (str === "emocional" || str === "emotional") return "emotional";
            if (str === "humor" || str === "engracado") return "humor";
            return "hook";
          }),
          justification,
          captionStyle,
          brollSuggestion,
          transcriptExcerpt: excerpt
        };
      });
      const sorted2 = ensureDistinctClipSet(sanitizedClips2.sort((a, b) => b.score - a.score), data.transcript, data.videoTitle || "");
      if (data.videoPath) {
        console.log(`📸 Gerando thumbnails profissionais para ${sorted2.length} clipes...`);
        const allTriggerTypes = ["humor", "controversy", "emotional", "hook", "high_value", "cliffhanger"];
        const TRIGGER_BG_MAP = {
          humor: "vibrant_gradient",
          controversy: "dark_gradient",
          emotional: "city_night",
          hook: "dark_gradient",
          high_value: "vibrant_gradient",
          cliffhanger: "abstract"
        };
        let resolvedStreamUrl;
        const isYouTube = data.videoPath.includes("youtube.com") || data.videoPath.includes("youtu.be");
        if (isYouTube) {
          try {
            console.log(`⚡ Resolvendo URL de stream do YouTube uma vez para todos os clips...`);
            const ytdlpCmd = `yt-dlp -g -f "bestvideo[ext=mp4]/best[ext=mp4]/best" "${data.videoPath}"`;
            const resolved = execSync(ytdlpCmd, {
              encoding: "utf-8",
              timeout: 25e3
            }).trim().split("\n")[0];
            if (resolved && resolved.startsWith("http")) {
              resolvedStreamUrl = resolved;
              console.log(`✅ Stream URL resolvida com sucesso! Reutilizando para todos os ${sorted2.length} clips.`);
            }
          } catch (ytErr) {
            console.warn(`⚠️ Não foi possível pré-resolver stream URL. Cada thumbnail chamará yt-dlp individualmente.`, ytErr);
          }
        }
        const clipsWithThumbs = [];
        for (let index = 0; index < sorted2.length; index++) {
          const clip = sorted2[index];
          try {
            const clipRealTrigger = clip.triggers && clip.triggers[0] ? clip.triggers[0] : allTriggerTypes[index % allTriggerTypes.length];
            const selectedTrigger = allTriggerTypes.includes(clipRealTrigger) ? clipRealTrigger : allTriggerTypes[index % allTriggerTypes.length];
            const timeParts = clip.startTimestamp.split(":").reverse();
            let startSeconds = 0;
            for (let i = 0; i < timeParts.length; i++) {
              startSeconds += (parseInt(timeParts[i], 10) || 0) * Math.pow(60, i);
            }
            const durationSec = clip.durationSeconds || 30;
            const EXTRACT_OFFSETS = [2, Math.floor(durationSec * 0.4), Math.floor(durationSec * 0.75)];
            const extractAtSeconds = startSeconds + EXTRACT_OFFSETS[index % EXTRACT_OFFSETS.length];
            const backgroundTemplate = TRIGGER_BG_MAP[selectedTrigger] ?? "dark_gradient";
            console.log(`  [${index + 1}/${sorted2.length}] Trigger real: ${selectedTrigger}, BG: ${backgroundTemplate}, ExtractAt: ${extractAtSeconds}s (Clip: ${clip.startTimestamp} dur:${durationSec}s)`);
            const result = await generateProfessionalThumbnail({
              data: {
                videoPath: data.videoPath,
                resolvedStreamUrl,
                // ⚡ URL pré-resolvida: evita yt-dlp por thumbnail
                clipTitle: clip.title,
                clipHook: clip.hookQuote,
                triggerType: selectedTrigger,
                extractAtSeconds,
                personPositions: ["center"],
                backgroundTemplate,
                compactLayout: (clip.durationSeconds || 0) < 30,
                useAdvancedEffects: true,
                clipId: clip.id
              }
            });
            clipsWithThumbs.push({
              ...clip,
              thumbnailDataUrl: result.success ? result.thumbnailDataUrl : void 0
            });
          } catch (error) {
            console.warn(`⚠️ Thumbnail falhou para "${clip.title}":`, error);
            clipsWithThumbs.push(clip);
          }
        }
        return {
          clips: ensureDistinctClipSet(clipsWithThumbs, data.transcript, data.videoTitle || "")
        };
      }
      return {
        clips: sorted2
      };
    }
    const response = await fetch(aiConfig.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiConfig.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages: [{
          role: "system",
          content: SYSTEM_PROMPT + (positiveExamplesPrompt ? `

${positiveExamplesPrompt}` : "")
        }, {
          role: "user",
          content: userPrompt
        }],
        tools: [{
          type: "function",
          function: {
            name: "return_viral_clips",
            description: "Retorna os 5 melhores clipes virais identificados",
            parameters: RESPONSE_SCHEMA
          }
        }],
        tool_choice: {
          type: "function",
          function: {
            name: "return_viral_clips"
          }
        }
      })
    });
    if (response.status === 429) {
      return {
        clips: [],
        error: "Limite de requisições atingido. Tente novamente em alguns instantes."
      };
    }
    if (response.status === 402) {
      return {
        clips: [],
        error: "Créditos esgotados. Abra Settings → Workspace → Billing and usage para recarregar créditos."
      };
    }
    if (!response.ok) {
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return {
        clips: [],
        error: `Erro na análise (${response.status}).`
      };
    }
    const json = await response.json();
    const toolCall = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return {
        clips: [],
        error: "Resposta inválida do modelo."
      };
    }
    const parsed = JSON.parse(toolCall.function.arguments);
    const sanitizedClips = parsed.clips.map((clipObj) => {
      const id = clipObj.id || `clip_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
      let title = String(clipObj.title || "");
      let hookQuote = String(clipObj.hookQuote || "");
      let justification = String(clipObj.justification || "Trecho com alto potencial viral.");
      let startTimestamp = String(clipObj.startTimestamp || "00:00");
      let endTimestamp = String(clipObj.endTimestamp || "00:00");
      const startSec = parseTimestampToSeconds(startTimestamp);
      const endSec = parseTimestampToSeconds(endTimestamp);
      let durationSeconds = endSec - startSec;
      if (durationSeconds <= 0 || isNaN(durationSeconds)) {
        durationSeconds = 30;
      }
      const excerpt = extractTranscriptExcerpt(data.transcript, startTimestamp, endTimestamp);
      const captionStyle = "Legendas dinâmicas com palavras-chave destacadas";
      const brollSuggestion = "Corte rápido, zoom sutil e emojis de suporte";
      const badWords = ["[", "]", "título", "viral", "magnético", "coloque", "exemplo"];
      const isPt = isTranscriptPortuguese(data.transcript);
      const isTitleBad = !title || badWords.some((w) => title.toLowerCase().includes(w)) || isPt && isHallucinated(title, excerpt);
      const isHookBad = !hookQuote || badWords.some((w) => hookQuote.toLowerCase().includes(w)) || isPt && isHallucinated(hookQuote, excerpt);
      if (justification.includes("[")) justification = "Trecho com forte retenção inicial e valor entregue no final.";
      if (isTitleBad || isHookBad) {
        const engaging = buildEngagingTitleAndHook(excerpt, clipObj.triggers || ["hook"], startTimestamp);
        if (isTitleBad) {
          title = engaging.title;
        }
        if (isHookBad) {
          hookQuote = engaging.hookQuote;
        }
      }
      if (!title) title = "CORTE VIRAL";
      if (!hookQuote) hookQuote = "Assista até o final...";
      return {
        ...clipObj,
        id,
        title,
        hookQuote,
        justification,
        durationSeconds,
        captionStyle,
        brollSuggestion,
        transcriptExcerpt: excerpt
      };
    });
    const sorted = ensureDistinctClipSet([...sanitizedClips].sort((a, b) => b.score - a.score), data.transcript, data.videoTitle || "");
    if (data.videoPath) {
      console.log(`📸 Gerando thumbnails profissionais para ${sorted.length} clipes...`);
      const allTriggerTypes = ["humor", "controversy", "emotional", "hook", "high_value", "cliffhanger"];
      const TRIGGER_BG_MAP2 = {
        humor: "vibrant_gradient",
        controversy: "dark_gradient",
        emotional: "city_night",
        hook: "dark_gradient",
        high_value: "vibrant_gradient",
        cliffhanger: "abstract"
      };
      const clipsWithThumbs = [];
      for (let index = 0; index < sorted.length; index++) {
        const clip = sorted[index];
        try {
          const clipRealTrigger2 = clip.triggers && clip.triggers[0] ? clip.triggers[0] : allTriggerTypes[index % allTriggerTypes.length];
          const selectedTrigger = allTriggerTypes.includes(clipRealTrigger2) ? clipRealTrigger2 : allTriggerTypes[index % allTriggerTypes.length];
          const timeParts = clip.startTimestamp.split(":").reverse();
          let startSeconds = 0;
          for (let i = 0; i < timeParts.length; i++) {
            startSeconds += (parseInt(timeParts[i], 10) || 0) * Math.pow(60, i);
          }
          const durationSec2 = clip.durationSeconds || 30;
          const EXTRACT_OFFSETS2 = [2, Math.floor(durationSec2 * 0.4), Math.floor(durationSec2 * 0.75)];
          const extractAtSeconds = startSeconds + EXTRACT_OFFSETS2[index % EXTRACT_OFFSETS2.length];
          const backgroundTemplate = TRIGGER_BG_MAP2[selectedTrigger] ?? "dark_gradient";
          console.log(`  [${index + 1}/${sorted.length}] Trigger real: ${selectedTrigger}, BG: ${backgroundTemplate}, ExtractAt: ${extractAtSeconds}s (Clip: ${clip.startTimestamp} dur:${durationSec2}s)`);
          const result = await generateProfessionalThumbnail({
            data: {
              videoPath: data.videoPath,
              clipTitle: clip.title,
              clipHook: clip.hookQuote,
              triggerType: selectedTrigger,
              extractAtSeconds,
              personPositions: ["center"],
              backgroundTemplate,
              useAdvancedEffects: true,
              clipId: clip.id
            }
          });
          clipsWithThumbs.push({
            ...clip,
            thumbnailDataUrl: result.success ? result.thumbnailDataUrl : void 0
          });
        } catch (error) {
          console.warn(`⚠️ Thumbnail falhou para "${clip.title}":`, error);
          clipsWithThumbs.push(clip);
        }
      }
      return {
        clips: ensureDistinctClipSet(clipsWithThumbs, data.transcript, data.videoTitle || "")
      };
    }
    return {
      clips: sorted
    };
  } catch (e) {
    console.error("analyzeTranscript failed:", e);
    return {
      clips: [],
      error: e instanceof Error ? e.message : "Erro desconhecido."
    };
  }
});
const SaveFeedbackSchema = z.object({
  transcriptExcerpt: z.string(),
  originalTitle: z.string(),
  approvedTitle: z.string(),
  originalHook: z.string(),
  approvedHook: z.string(),
  rating: z.number().int().min(-1).max(1),
  platform: z.string().optional(),
  tone: z.string().optional()
});
const saveClipFeedback_createServerFn_handler = createServerRpc({
  id: "3507858f84ff3674924e4ef7e44106360e6c00f800f574226fda0f6a25edfa5f",
  name: "saveClipFeedback",
  filename: "src/lib/clips.functions.ts"
}, (opts) => saveClipFeedback.__executeServer(opts));
const saveClipFeedback = createServerFn({
  method: "POST"
}).inputValidator((data) => SaveFeedbackSchema.parse(data)).handler(saveClipFeedback_createServerFn_handler, async ({
  data
}) => {
  try {
    const admin = workerSupabase;
    const {
      data: existing
    } = await admin.from("clip_feedback").select("id").eq("transcript_excerpt", data.transcriptExcerpt).limit(1);
    let result;
    if (existing && existing.length > 0) {
      result = await admin.from("clip_feedback").update({
        approved_title: data.approvedTitle,
        approved_hook: data.approvedHook,
        rating: data.rating,
        platform: data.platform,
        tone: data.tone
      }).eq("id", existing[0].id).select("*").single();
    } else {
      result = await admin.from("clip_feedback").insert({
        transcript_excerpt: data.transcriptExcerpt,
        original_title: data.originalTitle,
        approved_title: data.approvedTitle,
        original_hook: data.originalHook,
        approved_hook: data.approvedHook,
        rating: data.rating,
        platform: data.platform,
        tone: data.tone
      }).select("*").single();
    }
    if (result.error) {
      console.error("Erro ao salvar feedback:", result.error);
      return {
        success: false,
        error: result.error.message
      };
    }
    return {
      success: true,
      feedback: result.data
    };
  } catch (e) {
    console.error("Falha ao processar saveClipFeedback:", e);
    return {
      success: false,
      error: e.message || "Erro interno do servidor."
    };
  }
});
export {
  analyzeTranscript_createServerFn_handler,
  saveClipFeedback_createServerFn_handler
};
