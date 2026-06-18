import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { u as useServerFn, e as exchangeYoutubeCode } from "./youtube-auth.server-tiJjkvkH.js";
import { useMutation } from "@tanstack/react-query";
import { useRef, useEffect, useState } from "react";
import { toast, Toaster as Toaster$1 } from "sonner";
import { c as createSsrRpc } from "./createSsrRpc-CkdUDiOt.js";
import { a as createServerFn } from "./server-BFBebUZd.js";
import { z } from "zod";
import { X, Type, Paintbrush, Check, Smile, Award, AlignJustify, Sparkles, Zap, RotateCcw, Save, ThumbsUp, ThumbsDown, Edit2, Play, ChevronDown, Copy } from "lucide-react";
import { r as resolveOAuthRedirectUri, g as getGoogleClientId } from "./youtube-auth.functions-CU9bAhlv.js";
import "@tanstack/react-router";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
const InputSchema$1 = z.object({
  transcript: z.string().min(50).max(8e4),
  videoTitle: z.string().max(300).optional().default(""),
  videoPath: z.string().optional(),
  // 🎬 Caminho do vídeo para gerar thumbnails
  platform: z.string().max(50).optional().default("TikTok/Reels (9:16)"),
  tone: z.string().max(100).optional().default("High Energy")
});
const analyzeTranscript = createServerFn({
  method: "POST"
}).inputValidator((data) => InputSchema$1.parse(data)).handler(createSsrRpc("37dd1fa2551a652cc263b8aa2522ab438df59bd7c96d35d7e7b09ee85406f3f4"));
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
const saveClipFeedback = createServerFn({
  method: "POST"
}).inputValidator((data) => SaveFeedbackSchema.parse(data)).handler(createSsrRpc("3507858f84ff3674924e4ef7e44106360e6c00f800f574226fda0f6a25edfa5f"));
const InputSchema = z.object({
  url: z.string().url().max(500)
});
const fetchTranscript = createServerFn({
  method: "POST"
}).inputValidator((data) => InputSchema.parse(data)).handler(createSsrRpc("fdc99a6ad5ce2c27d3d3aac698bb9a659bd505df5fc98b87522f16c5bbfd0715"));
const RenderJobClipSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(200),
  score: z.number().min(0).max(100),
  startTimestamp: z.string().min(1).max(20),
  endTimestamp: z.string().min(1).max(20),
  durationSeconds: z.number().min(1).max(300),
  hookQuote: z.string().min(1).max(500),
  triggers: z.array(z.string()).min(1),
  justification: z.string().min(1).max(1e3),
  captionStyle: z.string().min(1).max(500),
  brollSuggestion: z.string().min(1).max(500),
  transcriptExcerpt: z.string().min(1).max(1e3),
  thumbnailDataUrl: z.string().optional().nullable()
});
const createRenderJobInput = z.object({
  videoUrl: z.string().url().max(500),
  videoTitle: z.string().max(300).optional().default(""),
  platform: z.string().max(80).default("TikTok/Reels (9:16)"),
  renderFormat: z.string().max(80).default("9:16"),
  clipItems: z.array(RenderJobClipSchema).min(1),
  instructions: z.string().max(5e3).optional().default("")
});
const listRenderJobsInput = z.object({
  limit: z.number().int().min(1).max(50).optional().default(10)
});
const createRenderJob = createServerFn({
  method: "POST"
}).inputValidator((data) => createRenderJobInput.parse(data)).handler(createSsrRpc("3abd7d430233dc5f929d074972ce75e0693a5db085ce21160f3379ffb5783e79"));
const listRenderJobs = createServerFn({
  method: "POST"
}).inputValidator((data) => listRenderJobsInput.parse(data)).handler(createSsrRpc("43051d452bc40d80f7169ad50e22b568c781493cba86d7fe82049b05d789b7ed"));
const clearOldRenderJobs = createServerFn({
  method: "POST"
}).handler(createSsrRpc("e073ea43fcaeb40428cb4ac6689ab987e301a12b552cf675eac4473ae7a24af9"));
const retryRenderJob = createServerFn({
  method: "POST"
}).inputValidator((data) => z.object({
  jobId: z.string().min(1)
}).parse(data)).handler(createSsrRpc("449f70060e52faa58d5fed6a4640fba7f0dfbe66286a670e7e719cda5aacc9e7"));
const deleteRenderJob = createServerFn({
  method: "POST"
}).inputValidator((data) => z.object({
  jobId: z.string().min(1)
}).parse(data)).handler(createSsrRpc("e7ec4506f640ce4d890b018717de953fcbde25dfa18d402f07ab603b26c73d8d"));
const fetchYoutubeThumbnail = createServerFn({
  method: "GET"
}).inputValidator((data) => z.object({
  videoId: z.string().min(1)
}).parse(data)).handler(createSsrRpc("6f1cc574e77f5ba11c833fccbd59db03ea1da6ede09fb566f52129afe2e7fab8"));
function getViralPreset(triggerType) {
  const presets = {
    humor: {
      characterHighlights: [
        {
          x: 0.15,
          y: 0.4,
          width: 0.25,
          height: 0.45,
          intensity: "high",
          style: "spotlight"
        }
      ],
      visualEffects: [
        {
          type: "explosion",
          x: 0.15,
          y: 0.2,
          size: 0.15,
          color: "#FFD700",
          opacity: 0.9
        },
        {
          type: "lightning",
          x: 0.85,
          y: 0.3,
          size: 0.15,
          color: "#FFAA00",
          thickness: 4
        }
      ],
      cornerBadges: "hot",
      borderStyle: "neon",
      borderThickness: 12,
      useGlowEffect: true,
      characterBoxColor: "#FFD700"
    },
    controversy: {
      characterHighlights: [
        {
          x: 0.25,
          y: 0.35,
          width: 0.3,
          height: 0.5,
          intensity: "high",
          style: "neon-box"
        }
      ],
      visualEffects: [
        {
          type: "pulse-ring",
          x: 0.25,
          y: 0.6,
          size: 0.15,
          color: "#FF0000",
          thickness: 4
        },
        {
          type: "arrow",
          x: 0.8,
          y: 0.25,
          size: 0.2,
          color: "#FF0000",
          rotation: 45,
          opacity: 0.9
        }
      ],
      cornerBadges: "trending",
      borderStyle: "gradient",
      borderThickness: 14,
      useGlowEffect: true,
      characterBoxColor: "#FF0000"
    },
    emotional: {
      characterHighlights: [
        {
          x: 0.2,
          y: 0.3,
          width: 0.28,
          height: 0.52,
          intensity: "high",
          style: "halo"
        }
      ],
      visualEffects: [
        {
          type: "glow",
          x: 0.2,
          y: 0.55,
          size: 0.25,
          color: "#FF00FF",
          opacity: 0.4
        }
      ],
      cornerBadges: "exclusive",
      borderStyle: "gradient",
      borderThickness: 10,
      useGlowEffect: true,
      characterBoxColor: "#FF00FF"
    },
    hook: {
      characterHighlights: [
        {
          x: 0.15,
          y: 0.35,
          width: 0.3,
          height: 0.5,
          intensity: "high",
          style: "spotlight"
        }
      ],
      visualEffects: [
        {
          type: "circle",
          x: 0.85,
          y: 0.5,
          size: 0.1,
          color: "#00CCFF",
          thickness: 5,
          opacity: 0.8
        },
        {
          type: "arrow",
          x: 0.75,
          y: 0.3,
          size: 0.18,
          color: "#00CCFF",
          rotation: 135,
          opacity: 0.85
        }
      ],
      cornerBadges: "new",
      borderStyle: "neon",
      borderThickness: 11,
      useGlowEffect: true,
      characterBoxColor: "#00CCFF"
    },
    high_value: {
      characterHighlights: [
        {
          x: 0.22,
          y: 0.32,
          width: 0.27,
          height: 0.5,
          intensity: "high",
          style: "neon-box"
        }
      ],
      visualEffects: [
        {
          type: "star",
          x: 0.8,
          y: 0.3,
          size: 0.18,
          color: "#00FF00",
          thickness: 4,
          opacity: 0.9
        },
        {
          type: "pulse-ring",
          x: 0.8,
          y: 0.3,
          size: 0.12,
          color: "#00FF00",
          thickness: 3
        }
      ],
      cornerBadges: "trending",
      borderStyle: "gradient",
      borderThickness: 12,
      useGlowEffect: true,
      characterBoxColor: "#00FF00"
    },
    cliffhanger: {
      characterHighlights: [
        {
          x: 0.18,
          y: 0.33,
          width: 0.29,
          height: 0.52,
          intensity: "high",
          style: "halo"
        }
      ],
      visualEffects: [
        {
          type: "lightning",
          x: 0.82,
          y: 0.25,
          size: 0.2,
          color: "#FF6600",
          thickness: 5
        },
        {
          type: "explosion",
          x: 0.12,
          y: 0.25,
          size: 0.12,
          color: "#FFAA00",
          opacity: 0.85
        }
      ],
      cornerBadges: "hot",
      borderStyle: "neon",
      borderThickness: 13,
      useGlowEffect: true,
      characterBoxColor: "#FF6600"
    }
  };
  return presets[triggerType] || presets.hook;
}
const COLOR_SCHEMES = {
  humor: { colors: ["#FF4500", "#FFD700"], emoji: "😂", label: "Humor" },
  // More saturated orange
  controversy: { colors: ["#FF0000", "#FF6600"], emoji: "🤯", label: "Controvérsia" },
  // Pure red to orange
  emotional: { colors: ["#6B0066", "#FF00FF"], emoji: "❤️", label: "Emocional" },
  // Deep purple to magenta
  hook: { colors: ["#0066FF", "#00CCFF"], emoji: "👀", label: "Gancho" },
  // Bright blue to cyan
  high_value: { colors: ["#00CC00", "#00FF00"], emoji: "💎", label: "Alto Valor" },
  // Lime green
  cliffhanger: { colors: ["#FF6600", "#FFAA00"], emoji: "🔥", label: "Suspense" }
  // Orange to amber
};
function getDefaultConfig(clip) {
  const mainTrigger = clip.triggers[0] || "hook";
  const scheme = COLOR_SCHEMES[mainTrigger] ? mainTrigger : "hook";
  const enhancements = getViralPreset(mainTrigger);
  return {
    titleText: clip.title,
    subText: clip.hookQuote || "",
    colorScheme: scheme,
    emoji: COLOR_SCHEMES[scheme]?.emoji || "👀",
    showScore: true,
    textPosition: "center",
    enhancements,
    useViralEffects: true
    // Enable viral effects by default
  };
}
function ThumbnailCanvas({ clip, config, onExport, width = 320, youtubeThumbnailDataUrl, isPreRendered }) {
  const canvasRef = useRef(null);
  const height = Math.round(width * 9 / 16);
  const currentConfig = config || getDefaultConfig(clip);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let isCancelled = false;
    const drawCanvas = (bgImg) => {
      if (isCancelled) return;
      ctx.clearRect(0, 0, 1280, 720);
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      if (isPreRendered && bgImg) {
        ctx.drawImage(bgImg, 0, 0, 1280, 720);
        if (onExport) {
          try {
            const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
            onExport(dataUrl);
          } catch (err) {
            console.error("Erro ao exportar canvas da thumbnail:", err);
          }
        }
        return;
      }
      COLOR_SCHEMES[currentConfig.colorScheme] || COLOR_SCHEMES.hook;
      if (bgImg) {
        ctx.drawImage(bgImg, 0, 0, 1280, 720);
        const leftGrad = ctx.createLinearGradient(0, 0, 700, 0);
        leftGrad.addColorStop(0, "rgba(0, 0, 0, 0.8)");
        leftGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.6)");
        leftGrad.addColorStop(0.9, "rgba(0, 0, 0, 0.1)");
        leftGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = leftGrad;
        ctx.fillRect(0, 0, 700, 720);
      } else {
        ctx.fillStyle = "#0B0D22";
        ctx.fillRect(0, 0, 1280, 720);
      }
      const outerGlow = ctx.createRadialGradient(640, 360, 400, 640, 360, 900);
      outerGlow.addColorStop(0, "rgba(0, 0, 0, 0)");
      outerGlow.addColorStop(0.7, "rgba(0, 0, 0, 0.2)");
      outerGlow.addColorStop(1, "rgba(0, 0, 0, 0.6)");
      ctx.fillStyle = outerGlow;
      ctx.fillRect(0, 0, 1280, 720);
      if (currentConfig.showScore) {
        ctx.save();
        const bx = 1130;
        const by = 110;
        const radius2 = 65;
        ctx.beginPath();
        ctx.arc(bx, by, radius2, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "900 50px 'Outfit', 'Montserrat', 'Inter', sans-serif";
        ctx.fillText(clip.score.toString(), bx, by - 8);
        ctx.font = "bold 12px 'Outfit', 'Montserrat', 'Inter', sans-serif";
        ctx.fillStyle = "#ffff00";
        ctx.fillText("VIRAL", bx, by + 28);
        ctx.restore();
      }
      ctx.save();
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const titleText = (currentConfig.titleText || clip.title || "SEU TÍTULO").toUpperCase();
      const subTextValue = currentConfig.subText || "";
      let titleFontSize = 95;
      let subFontSize = 48;
      let titleLines = [];
      let subLines = [];
      let titleLineHeight = 0;
      let subLineHeight = 0;
      let totalTextHeight = 0;
      let totalTitleHeight = 0;
      let totalSubHeight = 0;
      const textGap = 35;
      const maxTextWidth = 590;
      for (let attempt = 0; attempt < 6; attempt++) {
        ctx.font = `900 ${titleFontSize}px 'Outfit', 'Montserrat', 'Inter', 'Segoe UI', sans-serif`;
        titleLineHeight = titleFontSize * 1.1;
        titleLines = wrapText(ctx, titleText, maxTextWidth);
        ctx.font = `italic 700 ${subFontSize}px 'Outfit', 'Montserrat', 'Inter', 'Segoe UI', sans-serif`;
        subLineHeight = subFontSize * 1.25;
        subLines = subTextValue ? wrapText(ctx, `"${subTextValue}"`, maxTextWidth) : [];
        totalTitleHeight = titleLines.length * titleLineHeight;
        totalSubHeight = subLines.length > 0 ? subLines.length * subLineHeight + textGap : 0;
        totalTextHeight = totalTitleHeight + totalSubHeight;
        if (totalTextHeight <= 580) {
          break;
        }
        titleFontSize = Math.floor(titleFontSize * 0.85);
        subFontSize = Math.floor(subFontSize * 0.85);
      }
      let startY = 120;
      if (currentConfig.textPosition === "center" || totalTextHeight < 400) {
        startY = (720 - totalTextHeight) / 2;
      } else if (currentConfig.textPosition === "bottom") {
        startY = 720 - 120 - totalTextHeight;
      }
      titleLines.forEach((line, idx) => {
        const lineY = startY + idx * titleLineHeight;
        ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 6;
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = Math.max(2, Math.floor(titleFontSize * 0.04));
        ctx.font = `900 ${titleFontSize}px 'Montserrat', 'Outfit', 'Inter', 'Segoe UI', sans-serif`;
        ctx.strokeText(line, 60, lineY);
        ctx.fillStyle = "#FFEB3B";
        ctx.fillText(line, 60, lineY);
      });
      if (subLines.length > 0) {
        const subStartY = startY + totalTitleHeight + textGap;
        subLines.forEach((line, idx) => {
          const lineY = subStartY + idx * subLineHeight;
          ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 4;
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = Math.max(2, Math.floor(subFontSize * 0.05));
          ctx.font = `800 ${subFontSize}px 'Montserrat', 'Outfit', 'Inter', 'Segoe UI', sans-serif`;
          ctx.strokeText(line, 60, lineY);
          ctx.fillStyle = "#ffffff";
          ctx.fillText(line, 60, lineY);
        });
      }
      ctx.restore();
      ctx.save();
      const badgeW = 320;
      const badgeH = 96;
      const badgeX = 1280 - badgeW - 28;
      const badgeY = 720 - badgeH - 28;
      ctx.fillStyle = "rgba(0, 0, 0, 0.38)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
      ctx.lineWidth = 2;
      const radius = 24;
      ctx.beginPath();
      ctx.moveTo(badgeX + radius, badgeY);
      ctx.lineTo(badgeX + badgeW - radius, badgeY);
      ctx.quadraticCurveTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + radius);
      ctx.lineTo(badgeX + badgeW, badgeY + badgeH - radius);
      ctx.quadraticCurveTo(badgeX + badgeW, badgeY + badgeH, badgeX + badgeW - radius, badgeY + badgeH);
      ctx.lineTo(badgeX + radius, badgeY + badgeH);
      ctx.quadraticCurveTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - radius);
      ctx.lineTo(badgeX, badgeY + radius);
      ctx.quadraticCurveTo(badgeX, badgeY, badgeX + radius, badgeY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.arc(badgeX + 48, badgeY + 48, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000000";
      ctx.font = "900 32px Arial Black, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("V", badgeX + 48, badgeY + 49);
      ctx.textAlign = "left";
      ctx.fillStyle = "#FFD700";
      ctx.font = "900 28px Arial Black, Arial, sans-serif";
      ctx.fillText("VIRALFORCE.AI", badgeX + 88, badgeY + 52);
      ctx.restore();
      if (onExport) {
        try {
          const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
          onExport(dataUrl);
        } catch (err) {
          console.error("Erro ao exportar canvas da thumbnail:", err);
        }
      }
    };
    if (youtubeThumbnailDataUrl) {
      const img = new Image();
      let srcUrl = youtubeThumbnailDataUrl;
      if (srcUrl.startsWith("http")) {
        img.crossOrigin = "anonymous";
        const separator = srcUrl.includes("?") ? "&" : "?";
        srcUrl = `${srcUrl}${separator}t=${Date.now()}`;
      }
      img.src = srcUrl;
      img.onload = () => {
        if (!isCancelled) {
          drawCanvas(img);
        }
      };
      img.onerror = (e) => {
        if (!isCancelled) {
          console.error("Erro ao carregar imagem de fundo da thumbnail. Usando fallback de gradiente.", e);
          drawCanvas(null);
        }
      };
    } else {
      drawCanvas(null);
    }
    return () => {
      isCancelled = true;
    };
  }, [clip, currentConfig, youtubeThumbnailDataUrl, onExport, isPreRendered]);
  const wrapText = (ctx, text, maxWidth) => {
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "relative overflow-hidden rounded-xl bg-slate-950 border border-border flex items-center justify-center",
      style: {
        width: `${width}px`,
        height: `${height}px`,
        aspectRatio: "16 / 9"
      },
      children: /* @__PURE__ */ jsx(
        "canvas",
        {
          ref: canvasRef,
          width: 1280,
          height: 720,
          style: {
            width: "100%",
            height: "100%",
            display: "block"
          }
        }
      )
    }
  );
}
const COMMON_EMOJIS = [
  "😂",
  "🤯",
  "❤️",
  "👀",
  "💎",
  "🔥",
  "💀",
  "🚨",
  "📈",
  "🧠",
  "🤫",
  "😱",
  "👇",
  "💡",
  "⚠️",
  "👑",
  "🚀",
  "💰"
];
function ThumbnailEditorModal({
  clip,
  initialConfig,
  isOpen,
  onClose,
  onSave,
  youtubeThumbnailDataUrl
}) {
  const [config, setConfig] = useState(
    () => initialConfig || getDefaultConfig(clip)
  );
  const [currentDataUrl, setCurrentDataUrl] = useState("");
  const previewKey = [
    config.titleText,
    config.subText,
    config.colorScheme,
    config.textPosition,
    config.showScore,
    config.emoji,
    config.enhancements?.borderStyle,
    config.enhancements?.cornerBadges
  ].join("::");
  useEffect(() => {
    if (isOpen) {
      setConfig(initialConfig || getDefaultConfig(clip));
    }
  }, [isOpen, initialConfig, clip]);
  if (!isOpen) return null;
  const handleReset = () => {
    setConfig(getDefaultConfig(clip));
  };
  const handleSave = () => {
    if (currentDataUrl) {
      onSave(currentDataUrl, config);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4 overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto md:h-[680px] max-h-[95vh] md:max-h-[90vh]", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onClose,
        className: "absolute top-4 right-4 z-10 p-2 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white transition-all hover:scale-105",
        children: /* @__PURE__ */ jsx(X, { className: "size-5" })
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "flex-1 bg-zinc-900/40 p-6 md:p-8 flex flex-col items-center justify-center border-r border-zinc-900/60 min-h-[300px] md:min-h-0", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-[560px] space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center md:text-left", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono tracking-widest text-primary uppercase font-bold", children: "Visualização ao Vivo" }),
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-white mt-1", children: "Sua Thumbnail (1280x720)" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "shadow-2xl rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-950 p-1", children: /* @__PURE__ */ jsx(
        ThumbnailCanvas,
        {
          clip,
          config,
          onExport: setCurrentDataUrl,
          width: 540,
          youtubeThumbnailDataUrl
        },
        previewKey
      ) }),
      /* @__PURE__ */ jsx("p", { className: "text-center text-xs text-zinc-500 font-mono", children: "O canvas acima é renderizado nativamente em alta resolução para o YouTube." })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "w-full md:w-[400px] bg-zinc-950 p-6 md:p-8 flex flex-col justify-between overflow-y-auto h-auto md:h-full", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-white", children: "Editor de Thumbnail" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400 mt-1", children: "Personalize o visual e textos do seu clipe." })
        ] }),
        /* @__PURE__ */ jsx("hr", { className: "border-zinc-800/60" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider", children: [
            /* @__PURE__ */ jsx(Type, { className: "size-3.5 text-primary" }),
            "Título Principal"
          ] }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: config.titleText,
              onChange: (e) => setConfig((prev) => ({ ...prev, titleText: e.target.value })),
              className: "w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none h-20 font-sans font-medium",
              placeholder: "Título vibrante e curto...",
              maxLength: 80
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-[10px] text-zinc-500 font-mono", children: [
            /* @__PURE__ */ jsx("span", { children: "Dica: Use palavras fortes" }),
            /* @__PURE__ */ jsxs("span", { children: [
              config.titleText.length,
              "/80"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider", children: [
            /* @__PURE__ */ jsx(Type, { className: "size-3.5 text-emerald-500" }),
            "Subtítulo (Gatilho)"
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: config.subText,
              onChange: (e) => setConfig((prev) => ({ ...prev, subText: e.target.value })),
              className: "w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-sans",
              placeholder: "Frase de impacto inferior...",
              maxLength: 60
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-[10px] text-zinc-500 font-mono", children: [
            /* @__PURE__ */ jsx("span", { children: "Será envolto em aspas" }),
            /* @__PURE__ */ jsxs("span", { children: [
              config.subText.length,
              "/60"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider", children: [
            /* @__PURE__ */ jsx(Paintbrush, { className: "size-3.5 text-amber-500" }),
            "Tema de Cores"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-2", children: Object.entries(COLOR_SCHEMES).map(([key, info]) => {
            const isSelected = config.colorScheme === key;
            return /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setConfig((prev) => ({ ...prev, colorScheme: key })),
                className: `relative overflow-hidden rounded-xl border p-2 text-left transition-all duration-200 hover:scale-[1.02] ${isSelected ? "border-white bg-zinc-900" : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"}`,
                children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "h-2 w-full rounded-full mb-1.5",
                      style: { background: `linear-gradient(90deg, ${info.colors[0]}, ${info.colors[1]})` }
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "block text-[10px] font-bold text-white leading-tight truncate", children: info.label }),
                  isSelected && /* @__PURE__ */ jsx("span", { className: "absolute top-1 right-1 size-3.5 bg-white text-black rounded-full grid place-items-center", children: /* @__PURE__ */ jsx(Check, { className: "size-2.5 stroke-[3]" }) })
                ]
              },
              key
            );
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider", children: [
            /* @__PURE__ */ jsx(Smile, { className: "size-3.5 text-rose-500" }),
            "Emoji Decorativo"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5 p-2.5 bg-zinc-900/50 border border-zinc-800/80 rounded-xl", children: COMMON_EMOJIS.map((emoji) => {
            const isSelected = config.emoji === emoji;
            return /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setConfig((prev) => ({ ...prev, emoji })),
                className: `size-8 text-lg rounded-lg transition-all hover:scale-110 active:scale-95 ${isSelected ? "bg-zinc-800 border border-zinc-600 shadow" : "hover:bg-zinc-800/40"}`,
                children: emoji
              },
              emoji
            );
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 pt-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider", children: [
              /* @__PURE__ */ jsx(Award, { className: "size-3 text-cyan-500" }),
              "Score Badge"
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setConfig((prev) => ({ ...prev, showScore: !prev.showScore })),
                className: `w-full py-2 px-3 text-xs rounded-xl font-bold border transition-all ${config.showScore ? "bg-zinc-900 border-zinc-700 text-white" : "bg-transparent border-zinc-900 text-zinc-500 hover:border-zinc-800"}`,
                children: config.showScore ? "Exibir Badge" : "Ocultar Badge"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider", children: [
              /* @__PURE__ */ jsx(AlignJustify, { className: "size-3 text-violet-500" }),
              "Alinhamento"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex bg-zinc-900 rounded-xl p-1 border border-zinc-800", children: ["top", "center", "bottom"].map((pos) => {
              const isSelected = config.textPosition === pos;
              return /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setConfig((prev) => ({ ...prev, textPosition: pos })),
                  className: `flex-1 py-1 text-[10px] font-bold rounded-lg uppercase transition-all ${isSelected ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`,
                  children: pos === "top" ? "Topo" : pos === "center" ? "Meio" : "Base"
                },
                pos
              );
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border-t border-zinc-800/60 pt-4", children: [
          /* @__PURE__ */ jsxs("h4", { className: "text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "size-3.5 text-yellow-500" }),
            "Efeitos Virais"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2 mb-4", children: [
            /* @__PURE__ */ jsxs("label", { className: "text-[10px] font-bold text-zinc-400 uppercase tracking-wider block", children: [
              /* @__PURE__ */ jsx(Zap, { className: "size-3 inline mr-1" }),
              "Estilo de Borda"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: ["solid", "neon", "double", "gradient", "none"].map((style) => {
              const enhancements = config.enhancements || {};
              const isSelected = (enhancements.borderStyle || "gradient") === style;
              return /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setConfig((prev) => ({
                    ...prev,
                    enhancements: {
                      ...prev.enhancements,
                      borderStyle: style
                    }
                  })),
                  className: `py-1.5 px-2 text-[10px] rounded-lg font-bold transition-all ${isSelected ? "bg-zinc-800 text-white border border-zinc-600" : "border border-zinc-900 text-zinc-500 hover:text-zinc-300"}`,
                  children: style === "solid" ? "Sólido" : style === "neon" ? "Neon" : style === "double" ? "Duplo" : style === "gradient" ? "Gradiente" : "Nenhum"
                },
                style
              );
            }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold text-zinc-400 uppercase tracking-wider block", children: "Badge de Canto" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: ["score", "new", "hot", "trending", "exclusive", null].map((badge) => {
              const enhancements = config.enhancements || {};
              const isSelected = (enhancements.cornerBadges || "score") === badge;
              const badgeLabels = {
                score: "Score",
                new: "Novo",
                hot: "Hot",
                trending: "Tendência",
                exclusive: "Exclusivo",
                none: "Nenhum"
              };
              return /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setConfig((prev) => ({
                    ...prev,
                    enhancements: {
                      ...prev.enhancements,
                      cornerBadges: badge
                    }
                  })),
                  className: `py-1.5 px-2 text-[10px] rounded-lg font-bold transition-all ${isSelected ? "bg-zinc-800 text-white border border-zinc-600" : "border border-zinc-900 text-zinc-500 hover:text-zinc-300"}`,
                  children: badgeLabels[badge || "none"]
                },
                badge || "none"
              );
            }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold text-zinc-400 uppercase tracking-wider block", children: "✨ Personagens Destacados" }),
            /* @__PURE__ */ jsx("p", { className: "text-[9px] text-zinc-500 mb-2", children: "Adicione retângulos ao redor dos personagens principais para destacá-los" }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  const newHighlight = {
                    x: 0.15,
                    y: 0.35,
                    width: 0.3,
                    height: 0.5,
                    intensity: "high",
                    style: "halo"
                  };
                  setConfig((prev) => ({
                    ...prev,
                    enhancements: {
                      ...prev.enhancements,
                      characterHighlights: [
                        ...prev.enhancements?.characterHighlights || [],
                        newHighlight
                      ]
                    }
                  }));
                },
                className: "flex-1 py-2 px-3 text-[10px] bg-blue-900/40 border border-blue-700/60 text-blue-300 rounded-lg hover:bg-blue-900/60 transition-all font-bold",
                children: "+ Adicionar Personagem"
              }
            ) }),
            /* @__PURE__ */ jsx("div", { className: "space-y-2 mt-3 max-h-32 overflow-y-auto", children: config.enhancements?.characterHighlights?.map((highlight, idx) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-2 bg-zinc-900/50 rounded-lg border border-zinc-800/60", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "text-[9px] text-zinc-400", children: [
                  "Personagem ",
                  idx + 1
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-[9px] text-zinc-500", children: [
                  "Estilo: ",
                  highlight.style === "halo" ? "Halo" : highlight.style === "spotlight" ? "Spotlight" : "Caixa"
                ] })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => {
                    const newHighlights = config.enhancements?.characterHighlights?.filter((_, i) => i !== idx) || [];
                    setConfig((prev) => ({
                      ...prev,
                      enhancements: {
                        ...prev.enhancements,
                        characterHighlights: newHighlights
                      }
                    }));
                  },
                  className: "px-2 py-1 text-[9px] bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 transition-all",
                  children: "×"
                }
              )
            ] }, idx)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3 mt-8 pt-4 border-t border-zinc-800/60", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleReset,
            className: "flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-900/60 transition-all active:scale-[0.98]",
            title: "Restaurar padrão",
            children: [
              /* @__PURE__ */ jsx(RotateCcw, { className: "size-3.5" }),
              "Resetar"
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onClose,
            className: "flex-1 py-2.5 rounded-xl border border-zinc-900 bg-transparent text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-900/30 transition-all active:scale-[0.98]",
            children: "Cancelar"
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleSave,
            className: "flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98] shadow-lg shadow-primary/10",
            children: [
              /* @__PURE__ */ jsx(Save, { className: "size-3.5" }),
              "Salvar"
            ]
          }
        )
      ] })
    ] })
  ] }) });
}
const TRIGGER_LABELS = {
  hook: "The Hook",
  cliffhanger: "Cliffhanger",
  high_value: "High Value",
  controversy: "Controversy",
  emotional: "Emotional",
  humor: "Humor"
};
function ClipCard({ clip, index, onPlay, thumbnailConfig, onThumbnailSave, youtubeThumbnailDataUrl, preRenderedDataUrl, onClipEdit }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(clip.title);
  const [tempHook, setTempHook] = useState(clip.hookQuote);
  const [rating, setRating] = useState(null);
  const saveFeedback = useServerFn(saveClipFeedback);
  const handleSaveEdit = async () => {
    if (!tempTitle.trim() || !tempHook.trim()) {
      toast.error("O título e o gancho não podem ser vazios.");
      return;
    }
    if (onClipEdit) {
      onClipEdit(index, {
        ...clip,
        title: tempTitle.trim(),
        hookQuote: tempHook.trim()
      });
    }
    setIsEditing(false);
    toast.success("Corte atualizado e salvo!");
    try {
      const res = await saveFeedback({
        data: {
          transcriptExcerpt: clip.transcriptExcerpt,
          originalTitle: clip.title,
          approvedTitle: tempTitle.trim(),
          originalHook: clip.hookQuote,
          approvedHook: tempHook.trim(),
          rating: 1
        }
      });
      if (res.success) {
        setRating(1);
        toast.success("A IA aprendeu com a sua correção! 🧠");
      }
    } catch (err) {
      console.warn("Erro ao salvar feedback da correção:", err);
    }
  };
  const handleRating = async (newRating) => {
    const ratingValue = rating === newRating ? null : newRating;
    if (ratingValue === null) {
      setRating(null);
      return;
    }
    try {
      const res = await saveFeedback({
        data: {
          transcriptExcerpt: clip.transcriptExcerpt,
          originalTitle: clip.title,
          approvedTitle: clip.title,
          originalHook: clip.hookQuote,
          approvedHook: clip.hookQuote,
          rating: ratingValue
        }
      });
      if (res.success) {
        setRating(ratingValue);
        if (ratingValue === 1) {
          toast.success("Feedback positivo enviado! A IA priorizará esse padrão. 🧠");
        } else {
          toast.success("Feedback negativo enviado! A IA evitará esse padrão.");
        }
      } else {
        toast.error(`Falha ao registrar feedback: ${res.error}`);
      }
    } catch (err) {
      toast.error(`Erro ao comunicar com o servidor: ${err.message || err}`);
    }
  };
  const isTop = index === 0;
  const scoreColor = clip.score >= 90 ? "border-primary" : clip.score >= 75 ? "border-primary/60" : "border-border";
  const effectiveConfig = thumbnailConfig || getDefaultConfig(clip);
  const copyAll = () => {
    const text = `${clip.title}
${clip.startTimestamp} → ${clip.endTimestamp} (${clip.durationSeconds}s)

HOOK: ${clip.hookQuote}

JUSTIFICATIVA: ${clip.justification}

LEGENDAS: ${clip.captionStyle}
B-ROLL: ${clip.brollSuggestion}

TRECHO: "${clip.transcriptExcerpt}"`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "group bg-surface border border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 animate-entry flex flex-col",
      style: { animationDelay: `${200 + index * 100}ms` },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-6", children: [
          /* @__PURE__ */ jsx("div", { className: `size-16 rounded-full border-4 ${scoreColor} grid place-items-center shrink-0`, children: /* @__PURE__ */ jsx("span", { className: "font-display text-2xl leading-none", children: clip.score }) }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("div", { className: "font-mono text-[10px] text-muted-foreground uppercase mb-1", children: "Timestamp" }),
            /* @__PURE__ */ jsxs("div", { className: "font-mono text-sm text-primary", children: [
              clip.startTimestamp,
              " → ",
              clip.endTimestamp
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "font-mono text-[10px] text-muted-foreground mt-1", children: [
              clip.durationSeconds,
              "s"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative aspect-video w-full rounded-xl overflow-hidden mb-5 bg-zinc-950 border border-zinc-855/20 flex items-center justify-center", children: [
          /* @__PURE__ */ (() => {
            const hasBeenEdited = !!thumbnailConfig;
            const displayPreRendered = !!preRenderedDataUrl && !hasBeenEdited;
            return /* @__PURE__ */ jsx(
              ThumbnailCanvas,
              {
                clip,
                config: effectiveConfig,
                onExport: displayPreRendered ? void 0 : (dataUrl) => {
                  if (onThumbnailSave) {
                    onThumbnailSave(dataUrl, effectiveConfig);
                  }
                },
                width: 400,
                youtubeThumbnailDataUrl: displayPreRendered ? preRenderedDataUrl : youtubeThumbnailDataUrl,
                isPreRendered: displayPreRendered
              }
            );
          })(),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2", children: /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setShowEditor(true),
              className: "bg-white text-zinc-950 hover:bg-white/90 text-xs font-bold py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-black/20",
              children: [
                /* @__PURE__ */ jsx(Paintbrush, { className: "size-3.5" }),
                "Editar Thumbnail"
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 mb-4 bg-black/30 border border-border/40 rounded-xl p-2.5 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-display uppercase tracking-wider text-muted-foreground", children: "Ensinar IA:" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleRating(1),
                title: "Curtir e ensinar padrão para a IA",
                className: `p-2 rounded-lg transition-all active:scale-90 flex items-center justify-center border cursor-pointer ${rating === 1 ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-surface border-border/30 hover:border-emerald-500/50 hover:text-emerald-400 text-muted-foreground"}`,
                children: /* @__PURE__ */ jsx(ThumbsUp, { className: "size-4" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleRating(-1),
                title: "Rejeitar e ensinar IA a evitar",
                className: `p-2 rounded-lg transition-all active:scale-90 flex items-center justify-center border cursor-pointer ${rating === -1 ? "bg-rose-500/20 border-rose-500 text-rose-400" : "bg-surface border-border/30 hover:border-rose-500/50 hover:text-rose-400 text-muted-foreground"}`,
                children: /* @__PURE__ */ jsx(ThumbsDown, { className: "size-4" })
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "h-4 w-px bg-border/40 mx-1" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  if (isEditing) {
                    setIsEditing(false);
                  } else {
                    setTempTitle(clip.title);
                    setTempHook(clip.hookQuote);
                    setIsEditing(true);
                  }
                },
                title: "Editar textos do clipe",
                className: `p-2 rounded-lg transition-all active:scale-90 flex items-center justify-center border cursor-pointer ${isEditing ? "bg-primary/20 border-primary text-primary" : "bg-surface border-border/30 hover:border-primary/50 hover:text-primary text-muted-foreground"}`,
                children: /* @__PURE__ */ jsx(Edit2, { className: "size-4" })
              }
            )
          ] })
        ] }),
        isEditing ? /* @__PURE__ */ jsxs("div", { className: "mb-3 space-y-1", children: [
          /* @__PURE__ */ jsx("label", { className: "text-[9px] font-mono uppercase tracking-widest text-primary block", children: "Título do Clipe" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: tempTitle,
              onChange: (e) => setTempTitle(e.target.value),
              className: "w-full bg-black/60 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors",
              placeholder: "Digite o título do corte..."
            }
          )
        ] }) : /* @__PURE__ */ jsxs("h3", { className: "text-xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors", children: [
          isTop && /* @__PURE__ */ jsx("span", { className: "text-primary mr-1", children: "★" }),
          clip.title
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 mb-4", children: clip.triggers.map((t) => /* @__PURE__ */ jsx(
          "span",
          {
            className: "px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider",
            children: TRIGGER_LABELS[t] ?? t
          },
          t
        )) }),
        isEditing ? /* @__PURE__ */ jsxs("div", { className: "mb-4 space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[9px] font-mono uppercase tracking-widest text-primary block mb-1", children: "Gancho / Frase Falada (Hook)" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: tempHook,
                onChange: (e) => setTempHook(e.target.value),
                rows: 2,
                className: "w-full bg-black/60 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary transition-colors font-mono italic",
                placeholder: "Frase exata falada no início do clipe..."
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: handleSaveEdit,
                className: "flex-1 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer",
                children: [
                  /* @__PURE__ */ jsx(Check, { className: "size-3.5" }),
                  " Salvar e Ensinar IA"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setIsEditing(false),
                className: "px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer",
                children: [
                  /* @__PURE__ */ jsx(X, { className: "size-3.5" }),
                  " Cancelar"
                ]
              }
            )
          ] })
        ] }) : /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground mb-4 italic font-mono bg-black/40 p-3 rounded line-clamp-3", children: [
          '"',
          clip.hookQuote,
          '"'
        ] }),
        onPlay && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => onPlay(clip),
            className: "mb-4 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-display text-xs uppercase tracking-widest py-2.5 rounded-lg transition-all active:scale-[0.98] cursor-pointer",
            children: [
              /* @__PURE__ */ jsx(Play, { className: "size-3 fill-current" }),
              "Reproduzir clipe"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3 mb-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] font-display uppercase tracking-widest text-muted-foreground", children: "Viral Justification" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs leading-relaxed opacity-80", children: clip.justification })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setExpanded((v) => !v),
            className: "mt-auto flex items-center gap-2 text-[10px] font-display uppercase tracking-widest text-primary hover:text-primary/80 transition-colors pt-3 border-t border-border",
            children: [
              /* @__PURE__ */ jsx(ChevronDown, { className: `size-3 transition-transform ${expanded ? "rotate-180" : ""}` }),
              expanded ? "Recolher direção" : "Direção visual"
            ]
          }
        ),
        expanded && /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-4 text-xs animate-entry", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "font-mono text-[10px] uppercase tracking-widest text-primary mb-1", children: "Legendas dinâmicas" }),
            /* @__PURE__ */ jsx("p", { className: "opacity-80 leading-relaxed", children: clip.captionStyle })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "font-mono text-[10px] uppercase tracking-widest text-primary mb-1", children: "B-Roll / Emojis" }),
            /* @__PURE__ */ jsx("p", { className: "opacity-80 leading-relaxed", children: clip.brollSuggestion })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "font-mono text-[10px] uppercase tracking-widest text-primary mb-1", children: "Trecho da transcrição" }),
            /* @__PURE__ */ jsx("p", { className: "opacity-70 italic font-mono leading-relaxed bg-black/40 p-3 rounded", children: clip.transcriptExcerpt })
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: copyAll,
              className: "w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-display text-xs uppercase tracking-widest py-2.5 rounded-lg transition-all",
              children: [
                copied ? /* @__PURE__ */ jsx(Check, { className: "size-3" }) : /* @__PURE__ */ jsx(Copy, { className: "size-3" }),
                copied ? "Copiado" : "Copiar briefing"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          ThumbnailEditorModal,
          {
            clip,
            initialConfig: thumbnailConfig,
            isOpen: showEditor,
            onClose: () => setShowEditor(false),
            onSave: (dataUrl, config) => {
              if (onThumbnailSave) {
                onThumbnailSave(dataUrl, config);
              }
              setShowEditor(false);
            },
            youtubeThumbnailDataUrl
          }
        )
      ]
    }
  );
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const PublishJobInput = z.object({
  jobId: z.string().min(1),
  clipIndex: z.number().optional(),
  youtubeConfig: z.object({
    youtube_refresh_token: z.string(),
    privacy_status: z.string(),
    default_hashtags: z.string().optional().default(""),
    default_tags: z.string().optional().default("")
  }).optional()
});
const publishJobToYoutube = createServerFn({
  method: "POST"
}).inputValidator((data) => PublishJobInput.parse(data)).handler(createSsrRpc("a772e898e4752953c72fd24d5e65fc648263137c3fc4c7f0226f371412ac8fcc"));
const PublishTiktokJobInput = z.object({
  jobId: z.string().min(1),
  clipIndex: z.number().optional(),
  tiktokConfig: z.object({
    target_platform: z.literal("tiktok"),
    tiktok_session_cookie: z.string().optional().default(""),
    tiktok_profile_name: z.string(),
    default_hashtags: z.string().optional().default("")
  })
});
const publishJobToTiktok = createServerFn({
  method: "POST"
}).inputValidator((data) => PublishTiktokJobInput.parse(data)).handler(createSsrRpc("f4693f7df910dfe4afb9e936a829260c5518a100a32a6ff884fa14531961bcc5"));
const checkYoutubeToken = createServerFn({
  method: "POST"
}).handler(createSsrRpc("533b9564ef9decebe1e6faa365cc98a04d6788a9782b30938f79b63e289e366c"));
const PLACEHOLDER = `Cole aqui a transcrição completa do seu vídeo longo (podcast, entrevista, aula)...

Exemplo: [00:00] Hoje eu vou te mostrar o erro que 99% dos empreendedores cometem...`;
function parseTimestampToSeconds(ts) {
  const parts = ts.split(":").map((p) => parseInt(p, 10) || 0);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}
function platformCaption(platform, clip) {
  const base = `${clip.hookQuote}`;
  if (platform.includes("TikTok") || platform.includes("Reels")) return `${base}

#fyp #foryou #viral #parati #brasil`;
  if (platform.includes("Shorts")) return `${base}

#shorts #viral #brasil`;
  if (platform.includes("LinkedIn")) return `${base}

O que você pensa sobre isso? Comenta aí 👇

#carreira #lideranca`;
  return base;
}
function exportInstructions(clips, videoTitle, videoId, platform) {
  const url = videoId ? `https://youtube.com/watch?v=${videoId}` : "(transcrição manual)";
  const crop = platform.includes("9:16") || platform.includes("Shorts") ? "9:16 (1080x1920)" : platform.includes("LinkedIn") ? "1:1 ou 16:9" : "conforme plataforma";
  const lines = [`VIRALFORCE.AI · BRIEFING DE CORTES`, `===================================`, `Vídeo: ${videoTitle || "(sem título)"}`, `Fonte: ${url}`, `Plataforma alvo: ${platform}`, `Total de clipes: ${clips.length}`, `Gerado em: ${(/* @__PURE__ */ new Date()).toLocaleString("pt-BR")}`, ``, `INSTRUÇÕES (CapCut / InShot / Premiere):`, `1. Abra o vídeo original no editor`, `2. Para cada clipe, corte nos timestamps abaixo`, `3. Aplique crop ${crop}`, `4. Cole a legenda sugerida na descrição do post`, ``, `===================================`, ``];
  clips.forEach((c, i) => {
    lines.push(`[CLIPE ${String(i + 1).padStart(2, "0")}] · Score ${c.score}/100`, `Título: ${c.title}`, `Timestamps: ${c.startTimestamp} → ${c.endTimestamp} (${c.durationSeconds}s)`, `Link direto: ${videoId ? `https://youtu.be/${videoId}?t=${parseTimestampToSeconds(c.startTimestamp)}` : "(n/a)"}`, `Gatilhos: ${c.triggers.join(", ")}`, ``, `--- LEGENDA PARA POSTAGEM (${platform}) ---`, platformCaption(platform, c), ``, `--- DIREÇÃO VISUAL ---`, `Legendas: ${c.captionStyle}`, `B-roll: ${c.brollSuggestion}`, ``, `--- TRECHO ---`, `"${c.transcriptExcerpt}"`, ``, `===================================`, ``);
  });
  const blob = new Blob([lines.join("\n")], {
    type: "text/plain;charset=utf-8"
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `viralforce-${(videoTitle || "clipes").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
}
function extractYoutubeLinks(outputPath) {
  if (!outputPath) return [];
  const lower = outputPath.toLowerCase();
  const marker = "youtube:";
  const idx = lower.indexOf(marker);
  if (idx === -1) {
    return outputPath.split(" | ").map((s) => s.trim()).filter((s) => s.includes("youtube.com/watch") || s.includes("youtu.be/"));
  }
  const section = outputPath.slice(idx + marker.length);
  return section.split(" | ").map((s) => s.trim()).filter((s) => s.includes("youtube.com/watch") || s.includes("youtu.be/"));
}
function extractTikTokPublishInfo(outputPath) {
  if (!outputPath) return null;
  const marker = "TikTok:";
  const idx = outputPath.indexOf(marker);
  if (idx === -1) return null;
  return outputPath.slice(idx + marker.length).trim();
}
function Index() {
  const [transcript, setTranscript] = useState("");
  const [rawTranscript, setRawTranscript] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [platform, setPlatform] = useState("TikTok/Reels (9:16)");
  const [tone, setTone] = useState("Alta Energia");
  const [clips, setClips] = useState([]);
  const [sourceUrl, setSourceUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [jobs, setJobs] = useState([]);
  const [gsiReady, setGsiReady] = useState(false);
  const [redirectUri, setRedirectUri] = useState("");
  const [oauthStatus, setOauthStatus] = useState("Aguardando login do Google...");
  const [youtubeRefreshToken, setYoutubeRefreshToken] = useState("");
  const [playing, setPlaying] = useState(null);
  const [youtubeProfiles, setYoutubeProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [newProfileName, setNewProfileName] = useState("");
  const [editingProfileName, setEditingProfileName] = useState(null);
  const [editingHashtags, setEditingHashtags] = useState("");
  const [editingTags, setEditingTags] = useState("");
  const [editingPrivacy, setEditingPrivacy] = useState("private");
  const [tiktokProfiles, setTiktokProfiles] = useState([]);
  const [selectedTikTokProfile, setSelectedTikTokProfile] = useState("");
  const [newTikTokProfileName, setNewTikTokProfileName] = useState("");
  const [newTikTokSessionCookie, setNewTikTokSessionCookie] = useState("");
  const [newTikTokHashtags, setNewTikTokHashtags] = useState("#shorts,#tiktok,#viral");
  const [channelTab, setChannelTab] = useState("youtube");
  const [openYoutubeDropdown, setOpenYoutubeDropdown] = useState(null);
  const [openTiktokDropdown, setOpenTiktokDropdown] = useState(null);
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [clipThumbnails, setClipThumbnails] = useState({});
  const [clipThumbnailConfigs, setClipThumbnailConfigs] = useState({});
  const [youtubeThumbnailDataUrl, setYoutubeThumbnailDataUrl] = useState(null);
  const [envTokenStatus, setEnvTokenStatus] = useState({
    checked: false,
    valid: true,
    reason: null,
    configured: false
  });
  const handleSaveThumbnail = (clipIndex, dataUrl, config) => {
    setClipThumbnails((prev) => ({
      ...prev,
      [clipIndex]: dataUrl
    }));
    setClipThumbnailConfigs((prev) => ({
      ...prev,
      [clipIndex]: config
    }));
  };
  const analyze = useServerFn(analyzeTranscript);
  useServerFn(exchangeYoutubeCode);
  const fetchT = useServerFn(fetchTranscript);
  const createJob = useServerFn(createRenderJob);
  const listJobs = useServerFn(listRenderJobs);
  const publish = useServerFn(publishJobToYoutube);
  const publishTiktok = useServerFn(publishJobToTiktok);
  const clearJobs = useServerFn(clearOldRenderJobs);
  const checkToken = useServerFn(checkYoutubeToken);
  const clearOldJobsMutation = useMutation({
    mutationFn: async () => {
      const result = await clearJobs();
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      toast.success("Histórico de jobs limpo.");
      void fetchJobs();
    },
    onError: (e) => toast.error(e.message)
  });
  const fetchMutation = useMutation({
    mutationFn: async () => {
      const r = await fetchT({
        data: {
          url: sourceUrl
        }
      });
      if (r.error) throw new Error(r.error);
      return r;
    },
    onSuccess: (r) => {
      setTranscript(r.transcript);
      setRawTranscript(r.rawTranscript || r.transcript);
      if (r.videoTitle) setVideoTitle(r.videoTitle);
      if (r.videoId) setVideoId(r.videoId);
      toast.success("Transcrição importada do YouTube");
    },
    onError: (e) => toast.error(e.message)
  });
  const renderFormat = platform.includes("LinkedIn") ? "16:9" : "9:16";
  const renderMutation = useMutation({
    mutationFn: async () => {
      if (!sourceUrl.trim()) {
        throw new Error("É necessário um link de vídeo para criar um job local.");
      }
      let jobInstructions = JSON.stringify({
        target_platform: "local"
      });
      if (selectedProfile) {
        const profile = youtubeProfiles.find((p) => p.name === selectedProfile);
        if (profile && profile.refreshToken) {
          jobInstructions = JSON.stringify({
            youtube_refresh_token: profile.refreshToken,
            privacy_status: profile.privacyStatus || "private",
            default_hashtags: profile.defaultHashtags || "",
            default_tags: profile.defaultTags || "",
            target_profile_name: profile.name
          });
        }
      } else if (selectedTikTokProfile) {
        const profile = tiktokProfiles.find((p) => p.name === selectedTikTokProfile);
        if (profile) {
          jobInstructions = JSON.stringify({
            target_platform: "tiktok",
            tiktok_session_cookie: profile.sessionCookie || "",
            tiktok_profile_name: profile.name,
            default_hashtags: profile.defaultHashtags || ""
          });
        }
      }
      const result = await createJob({
        data: {
          videoUrl: sourceUrl.trim(),
          videoTitle,
          platform,
          renderFormat,
          clipItems: clips.map((c, idx) => ({
            ...c,
            thumbnailDataUrl: clipThumbnails[idx] || c.thumbnailDataUrl || null
          })),
          instructions: jobInstructions
        }
      });
      if (result.error || !result.job) {
        throw new Error(result.error || "Falha ao criar o job de renderização.");
      }
      return result.job;
    },
    onSuccess: (job) => {
      setJobs((prev) => [{
        ...job,
        output_path: job.output_path || "Job recebido. Aguardando worker local..."
      }, ...prev]);
      toast.success("Job criado e enviado para o worker local.");
      setShowWorkerModal(true);
    },
    onError: (e) => toast.error(e.message)
  });
  const publishMutation = useMutation({
    mutationFn: async ({
      jobId,
      clipIndex,
      profile
    }) => {
      let youtubeConfig;
      if (profile && profile.refreshToken) {
        youtubeConfig = {
          youtube_refresh_token: profile.refreshToken,
          privacy_status: profile.privacyStatus || "private",
          default_hashtags: profile.defaultHashtags || "",
          default_tags: profile.defaultTags || ""
        };
      }
      const result = await publish({
        data: {
          jobId,
          clipIndex,
          youtubeConfig
        }
      });
      if (!result.ok) {
        throw new Error(result.error || "Falha ao publicar no YouTube.");
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Solicitação de publicação enviada ao worker local.");
      void fetchJobs();
    },
    onError: (e) => toast.error(e.message)
  });
  const publishTiktokMutation = useMutation({
    mutationFn: async ({
      jobId,
      clipIndex,
      profile
    }) => {
      const tiktokConfig = {
        target_platform: "tiktok",
        tiktok_session_cookie: profile.sessionCookie || "",
        tiktok_profile_name: profile.name,
        default_hashtags: profile.defaultHashtags || ""
      };
      const result = await publishTiktok({
        data: {
          jobId,
          clipIndex,
          tiktokConfig
        }
      });
      if (!result.ok) {
        throw new Error(result.error || "Falha ao publicar no TikTok.");
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Solicitação de publicação no TikTok enviada ao worker local.");
      void fetchJobs();
    },
    onError: (e) => toast.error(e.message)
  });
  const retryJob = useServerFn(retryRenderJob);
  const retryMutation = useMutation({
    mutationFn: async (jobId) => {
      const result = await retryJob({
        data: {
          jobId
        }
      });
      if (!result.ok) {
        throw new Error(result.error || "Falha ao reiniciar o job.");
      }
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      void fetchJobs();
    },
    onError: (e) => toast.error(e.message)
  });
  const delJob = useServerFn(deleteRenderJob);
  const deleteMutation = useMutation({
    mutationFn: async (jobId) => {
      const result = await delJob({
        data: {
          jobId
        }
      });
      if (!result.ok) {
        throw new Error(result.error || "Falha ao excluir o job.");
      }
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      void fetchJobs();
    },
    onError: (e) => toast.error(e.message)
  });
  const mutation = useMutation({
    mutationFn: async () => {
      const result = await analyze({
        data: {
          transcript: rawTranscript || transcript,
          videoTitle,
          platform,
          tone,
          videoPath: sourceUrl.trim() || void 0
        }
      });
      if (result.error) throw new Error(result.error);
      return result.clips;
    },
    onSuccess: (data) => {
      setClipThumbnails({});
      setClipThumbnailConfigs({});
      setYoutubeThumbnailDataUrl(null);
      setClips(data);
      toast.success(`${data.length} clipes virais extraídos`);
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({
          behavior: "smooth"
        });
      }, 100);
    },
    onError: (e) => toast.error(e.message)
  });
  const fetchJobs = async () => {
    const result = await listJobs({
      data: {
        limit: 8
      }
    });
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setJobs(result.jobs ?? []);
  };
  const fetchFn = useServerFn(fetchYoutubeThumbnail);
  useEffect(() => {
    if (!videoId) {
      setYoutubeThumbnailDataUrl(null);
      return;
    }
    let cancelled = false;
    fetchFn({
      data: {
        videoId
      }
    }).then((result) => {
      if (!cancelled && result.dataUrl) {
        setYoutubeThumbnailDataUrl(result.dataUrl);
      }
    }).catch(() => {
    });
    return () => {
      cancelled = true;
    };
  }, [videoId]);
  useEffect(() => {
    checkToken().then((result) => {
      setEnvTokenStatus({
        checked: true,
        valid: result.valid,
        reason: result.reason ?? null,
        configured: result.configured
      });
    }).catch(() => {
    });
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncYoutubeAuth = () => {
      const savedToken = window.localStorage.getItem("hook_hustle_youtube_refresh_token") || "";
      if (savedToken) {
        setYoutubeRefreshToken(savedToken);
        setOauthStatus("Autenticação concluída. Token do YouTube disponível para o worker local.");
      } else {
        setYoutubeRefreshToken("");
        setOauthStatus("Aguardando login do Google...");
      }
      const savedProfiles = window.localStorage.getItem("hook_hustle_youtube_profiles") || "";
      if (savedProfiles) {
        try {
          const parsed = JSON.parse(savedProfiles);
          if (Array.isArray(parsed)) {
            setYoutubeProfiles(parsed);
          }
        } catch {
        }
      } else {
        const initial = [{
          name: "Humor",
          refreshToken: "",
          connectedAt: "",
          defaultHashtags: "#humor,#comedia,#shorts",
          defaultTags: "humor,comedia,engraçado",
          privacyStatus: "private"
        }, {
          name: "Futebol",
          refreshToken: "",
          connectedAt: "",
          defaultHashtags: "#futebol,#gols,#shorts",
          defaultTags: "futebol,gols,esporte",
          privacyStatus: "private"
        }, {
          name: "Tecnologia",
          refreshToken: "",
          connectedAt: "",
          defaultHashtags: "#tecnologia,#curiosidades,#shorts",
          defaultTags: "tecnologia,curiosidades,atualidades",
          privacyStatus: "private"
        }];
        window.localStorage.setItem("hook_hustle_youtube_profiles", JSON.stringify(initial));
        setYoutubeProfiles(initial);
      }
      const savedTikTok = window.localStorage.getItem("hook_hustle_tiktok_profiles") || "";
      if (savedTikTok) {
        try {
          const parsed = JSON.parse(savedTikTok);
          if (Array.isArray(parsed)) setTiktokProfiles(parsed);
        } catch {
        }
      } else {
        const ttInitial = [{
          name: "Humor TT",
          sessionCookie: "",
          addedAt: "",
          defaultHashtags: "#humor,#comedia,#fyp"
        }, {
          name: "Futebol TT",
          sessionCookie: "",
          addedAt: "",
          defaultHashtags: "#futebol,#gols,#fyp"
        }, {
          name: "Tecnologia TT",
          sessionCookie: "",
          addedAt: "",
          defaultHashtags: "#tecnologia,#tech,#fyp"
        }];
        window.localStorage.setItem("hook_hustle_tiktok_profiles", JSON.stringify(ttInitial));
        setTiktokProfiles(ttInitial);
      }
    };
    syncYoutubeAuth();
    window.addEventListener("storage", syncYoutubeAuth);
    return () => {
      window.removeEventListener("storage", syncYoutubeAuth);
    };
  }, []);
  const hasQueuedJob = jobs.some((j) => ["pending", "in_progress", "published_requested"].includes(j.status));
  useEffect(() => {
    if (typeof window === "undefined") return;
    void fetchJobs();
    const interval = hasQueuedJob ? 5e3 : 12e3;
    const timer = window.setInterval(() => {
      void fetchJobs();
    }, interval);
    return () => {
      window.clearInterval(timer);
    };
  }, [hasQueuedJob]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setRedirectUri(resolveOAuthRedirectUri(window.location.origin));
    const existing = document.querySelector("script[src='https://accounts.google.com/gsi/client']");
    if (existing) {
      setGsiReady(Boolean(window.google?.accounts?.oauth2?.initCodeClient));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGsiReady(Boolean(window.google?.accounts?.oauth2?.initCodeClient));
    document.head.appendChild(script);
    return () => {
      script.onload = null;
    };
  }, []);
  const canAnalyze = transcript.trim().length >= 50 && !mutation.isPending;
  const canCreateJob = clips.length > 0 && sourceUrl.trim().length > 0 && !renderMutation.isPending;
  jobs.some((job) => job.status === "done" || job.status === "completed");
  const youtubeAuthLabel = youtubeRefreshToken ? "Autenticação concluída" : "Worker configurado via .env";
  const youtubeAuthHint = youtubeRefreshToken ? "Token do YouTube disponível. O worker local pode publicar quando o job terminar." : "O worker local usará as credenciais do arquivo .env para publicar no YouTube.";
  const handleConnectYoutube = () => {
    const clientId = getGoogleClientId();
    const effectiveRedirectUri = resolveOAuthRedirectUri(typeof window !== "undefined" ? window.location.origin : void 0);
    if (youtubeRefreshToken) {
      setOauthStatus("Você já está autenticado com o Google. O token salvo será usado pelo worker local.");
      return;
    }
    if (!clientId) {
      toast.error("Configure VITE_GOOGLE_CLIENT_ID no ambiente para abrir o login do Google.");
      return;
    }
    if (!effectiveRedirectUri) {
      toast.error("Não foi possível determinar a URI de redirecionamento. Recarregue a página e tente novamente.");
      return;
    }
    if (!gsiReady || !window.google?.accounts?.oauth2?.initCodeClient) {
      toast.error("Aguarde o carregamento do Google Sign-In e tente novamente.");
      return;
    }
    setOauthStatus("Redirecionando para o Google...");
    const codeClient = window.google.accounts.oauth2.initCodeClient({
      client_id: clientId,
      scope: "openid email profile https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.force-ssl",
      ux_mode: "redirect",
      redirect_uri: effectiveRedirectUri,
      prompt: "consent select_account",
      access_type: "offline",
      include_granted_scopes: true
    });
    codeClient.requestCode();
  };
  const handleConnectProfile = (profileName) => {
    const clientId = getGoogleClientId();
    const effectiveRedirectUri = resolveOAuthRedirectUri(typeof window !== "undefined" ? window.location.origin : void 0);
    if (!clientId) {
      toast.error("Configure VITE_GOOGLE_CLIENT_ID no ambiente para abrir o login do Google.");
      return;
    }
    if (!effectiveRedirectUri) {
      toast.error("Não foi possível determinar a URI de redirecionamento. Recarregue a página.");
      return;
    }
    if (!gsiReady || !window.google?.accounts?.oauth2?.initCodeClient) {
      toast.error("Aguarde o carregamento do Google Sign-In e tente novamente.");
      return;
    }
    window.localStorage.setItem("pending_channel_profile_name", profileName);
    toast.success("Redirecionando para o Google...");
    const codeClient = window.google.accounts.oauth2.initCodeClient({
      client_id: clientId,
      scope: "openid email profile https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.force-ssl",
      ux_mode: "redirect",
      redirect_uri: effectiveRedirectUri,
      prompt: "consent select_account",
      access_type: "offline",
      include_granted_scopes: true
    });
    codeClient.requestCode();
  };
  const handleAddProfile = () => {
    if (!newProfileName.trim()) {
      toast.error("Insira o nome do canal.");
      return;
    }
    const name = newProfileName.trim();
    if (youtubeProfiles.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Já existe um canal com este nome.");
      return;
    }
    const updated = [...youtubeProfiles, {
      name,
      refreshToken: "",
      connectedAt: "",
      defaultHashtags: "#shorts,#viral",
      defaultTags: "cortes,shorts",
      privacyStatus: "private"
    }];
    setYoutubeProfiles(updated);
    window.localStorage.setItem("hook_hustle_youtube_profiles", JSON.stringify(updated));
    setNewProfileName("");
    toast.success(`Canal "${name}" adicionado. Agora conecte sua conta do Google.`);
  };
  const handleRemoveProfile = (profileName) => {
    if (confirm(`Deseja realmente remover o canal "${profileName}"?`)) {
      const updated = youtubeProfiles.filter((p) => p.name !== profileName);
      setYoutubeProfiles(updated);
      window.localStorage.setItem("hook_hustle_youtube_profiles", JSON.stringify(updated));
      if (selectedProfile === profileName) {
        setSelectedProfile("");
      }
      toast.success(`Canal "${profileName}" removido.`);
    }
  };
  const handleSaveProfileSettings = (profileName) => {
    const updated = youtubeProfiles.map((p) => {
      if (p.name === profileName) {
        return {
          ...p,
          defaultHashtags: editingHashtags,
          defaultTags: editingTags,
          privacyStatus: editingPrivacy
        };
      }
      return p;
    });
    setYoutubeProfiles(updated);
    window.localStorage.setItem("hook_hustle_youtube_profiles", JSON.stringify(updated));
    setEditingProfileName(null);
    toast.success("Configurações do canal salvas!");
  };
  const handleStartEditProfile = (profile) => {
    setEditingProfileName(profile.name);
    setEditingHashtags(profile.defaultHashtags || "");
    setEditingTags(profile.defaultTags || "");
    setEditingPrivacy(profile.privacyStatus || "private");
  };
  const handleAddTikTokProfile = () => {
    if (!newTikTokProfileName.trim()) {
      toast.error("Insira o nome do perfil TikTok.");
      return;
    }
    const name = newTikTokProfileName.trim();
    if (tiktokProfiles.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Já existe um perfil TikTok com este nome.");
      return;
    }
    const updated = [...tiktokProfiles, {
      name,
      sessionCookie: newTikTokSessionCookie.trim(),
      addedAt: (/* @__PURE__ */ new Date()).toISOString(),
      defaultHashtags: newTikTokHashtags.trim() || "#shorts,#tiktok,#viral"
    }];
    setTiktokProfiles(updated);
    window.localStorage.setItem("hook_hustle_tiktok_profiles", JSON.stringify(updated));
    setNewTikTokProfileName("");
    setNewTikTokSessionCookie("");
    setNewTikTokHashtags("#shorts,#tiktok,#viral");
    toast.success(`Perfil TikTok "${name}" adicionado!`);
  };
  const handleRemoveTikTokProfile = (profileName) => {
    if (confirm(`Remover perfil TikTok "${profileName}"?`)) {
      const updated = tiktokProfiles.filter((p) => p.name !== profileName);
      setTiktokProfiles(updated);
      window.localStorage.setItem("hook_hustle_tiktok_profiles", JSON.stringify(updated));
      if (selectedTikTokProfile === profileName) setSelectedTikTokProfile("");
      toast.success(`Perfil TikTok "${profileName}" removido.`);
    }
  };
  const getJobStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "na fila";
      case "in_progress":
        return "processando";
      case "published_requested":
        return "aguardando publicação";
      case "done":
        return "renderizado";
      case "completed":
        return "publicado";
      case "failed":
        return "falhou";
      default:
        return String(status);
    }
  };
  const isJobReadyToPublish = (status) => status === "done" || status === "completed";
  const isJobSuccess = (status) => status === "done" || status === "completed";
  const isJobPublishing = (status) => status === "published_requested";
  const jobQueueStage = (job) => {
    if (job.status === "done" || job.status === "completed") {
      return {
        label: "Concluído",
        index: 3
      };
    }
    if (job.status === "in_progress") {
      return {
        label: "Processando no worker",
        index: 2
      };
    }
    if (job.status === "published_requested") {
      return {
        label: "Enviado ao worker",
        index: 2
      };
    }
    return {
      label: "Job recebido",
      index: 1
    };
  };
  const formatElapsedTime = (startedAt) => {
    if (!startedAt) return "";
    const started = new Date(startedAt).getTime();
    if (Number.isNaN(started)) return "";
    const seconds = Math.max(0, Math.floor((Date.now() - started) / 1e3));
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${String(remainingSeconds).padStart(2, "0")}s`;
    }
    return `${remainingSeconds}s`;
  };
  const getQueueJobLabel = (job) => {
    if (job.status === "published_requested") return "Aguardando publicação no worker";
    if (job.status === "pending") return "Job recebido e aguardando worker";
    if (job.status === "in_progress") return "Processando no worker";
    if (job.status === "done" || job.status === "completed") return "Concluído";
    return job.status.replace("_", " ");
  };
  const activeJob = jobs.find((j) => j.status === "in_progress");
  const hasPending = jobs.some((j) => j.status === "pending" || j.status === "published_requested");
  const workerStatus = activeJob ? {
    label: "Worker Processando... ⚡",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    dotBg: "bg-amber-400",
    glow: "animate-ping bg-amber-300"
  } : hasPending ? {
    label: "Aguardando Fila ⏳",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    dotBg: "bg-blue-400",
    glow: "animate-pulse bg-blue-300"
  } : {
    label: "Worker Ativo & Pronto 🟢",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    dotBg: "bg-emerald-400",
    glow: "bg-emerald-300"
  };
  const processingJob = activeJob || jobs.find((j) => j.status === "pending" || j.status === "published_requested");
  const historyJobs = jobs.filter((j) => !["in_progress", "pending", "published_requested"].includes(j.status));
  const youtubePublishedClips = jobs.flatMap((job) => {
    const links = extractYoutubeLinks(job.output_path);
    const clipItems = job.clip_items || [];
    return links.map((url, i) => {
      const videoIdMatch = url.match(/[?&]v=([^&]+)/);
      return {
        url,
        videoId: videoIdMatch ? videoIdMatch[1] : "",
        title: clipItems[i]?.title || `Clipe ${i + 1}`,
        jobTitle: job.video_title || job.video_url,
        publishedAt: job.completed_at || job.created_at,
        jobId: job.id
      };
    });
  });
  const tiktokPublishedClips = jobs.flatMap((job) => {
    const isTikTokPub = extractTikTokPublishInfo(job.output_path);
    if (!isTikTokPub) return [];
    const files = (job.output_path || "").split(" | ").filter((s) => s.trim() && !s.includes("youtube.com") && !s.includes("Progress:") && !s.includes("TikTok:"));
    const clipItems = job.clip_items || [];
    return files.map((file, i) => {
      return {
        file,
        title: clipItems[i]?.title || `Clipe ${i + 1}`,
        jobTitle: job.video_title || job.video_url,
        publishedAt: job.completed_at || job.created_at,
        jobId: job.id,
        profileName: isTikTokPub
      };
    });
  });
  const isStep1Completed = transcript.trim().length >= 50;
  const isStep2Completed = isStep1Completed && clips.length > 0;
  const isStep3Completed = isStep2Completed && jobs.length > 0;
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground font-body selection:bg-primary/30 selection:text-white", style: {
    background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,58,237,0.12), transparent), #09090f"
  }, children: [
    /* @__PURE__ */ jsx(Toaster, { theme: "dark", richColors: true }),
    envTokenStatus.checked && !envTokenStatus.valid && envTokenStatus.configured && /* @__PURE__ */ jsxs("div", { className: "sticky top-0 z-[60] w-full border-b border-amber-500/40 px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap", style: {
      background: "rgba(120,60,0,0.92)",
      backdropFilter: "blur(12px)"
    }, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 min-w-0", children: [
        /* @__PURE__ */ jsx("span", { className: "text-amber-300 text-base shrink-0", children: "⚠️" }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-amber-200 text-xs font-semibold", children: "Token do YouTube expirado" }),
          /* @__PURE__ */ jsx("p", { className: "text-amber-300/80 text-[11px] font-mono truncate", children: envTokenStatus.reason })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => handleConnectYoutube(), className: "px-3 py-1.5 rounded-lg text-[11px] font-semibold font-mono uppercase tracking-widest text-black transition-all hover:opacity-90 active:scale-95", style: {
          background: "linear-gradient(135deg, #fbbf24, #f59e0b)"
        }, children: "Reconectar Google" }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setEnvTokenStatus((s) => ({
          ...s,
          checked: false
        })), className: "text-amber-400/60 hover:text-amber-300 font-mono text-xs px-2 py-1 transition-colors", children: "✕" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("nav", { className: "sticky top-0 z-50 border-b border-white/[0.07] px-6 h-16 flex items-center justify-between", style: {
      background: "rgba(9,9,15,0.85)",
      backdropFilter: "blur(16px)"
    }, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "size-8 rounded-lg flex items-center justify-center", style: {
          background: "linear-gradient(135deg, #7c3aed, #5b21b6)"
        }, children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-4 fill-white", children: /* @__PURE__ */ jsx("path", { d: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" }) }) }),
        /* @__PURE__ */ jsx("span", { className: "font-display text-2xl tracking-tighter uppercase", style: {
          background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }, children: "ViralForce.AI" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "hidden md:flex gap-3 items-center", children: [
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-widest", style: {
          background: "rgba(204,0,0,0.15)",
          border: "1px solid rgba(204,0,0,0.3)",
          color: "#ff6b6b"
        }, children: [
          /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-2.5 fill-current", children: /* @__PURE__ */ jsx("path", { d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" }) }),
          "YouTube"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-widest", style: {
          background: "rgba(254,44,85,0.12)",
          border: "1px solid rgba(254,44,85,0.28)",
          color: "#fe2c55"
        }, children: [
          /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-2.5 fill-current", children: /* @__PURE__ */ jsx("path", { d: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.35 6.34 6.34 0 006.34-6.35V9.01a8.27 8.27 0 004.85 1.56V7.12a4.85 4.85 0 01-1.09-.43z" }) }),
          "TikTok"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { className: "size-1.5 rounded-full bg-emerald-400 animate-pulse" }),
          "Engine v4.2"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-6 flex gap-8", children: [
      /* @__PURE__ */ jsx("aside", { className: "hidden lg:flex w-48 shrink-0 flex-col pt-12 sticky top-20 self-start h-screen", children: [{
        n: "01",
        label: "Transcrição",
        done: isStep1Completed,
        active: !isStep1Completed
      }, {
        n: "02",
        label: "Parâmetros",
        done: isStep2Completed,
        active: isStep1Completed && !isStep2Completed
      }, {
        n: "03",
        label: "Clipes & Corte",
        done: isStep3Completed,
        active: isStep2Completed && !isStep3Completed
      }, {
        n: "04",
        label: "Fila & Postar",
        done: jobs.length > 0,
        active: isStep3Completed && jobs.length === 0
      }].map((step, i, arr) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
        /* @__PURE__ */ jsx("div", { className: `size-9 rounded-full flex items-center justify-center font-mono text-xs font-bold border-2 transition-all duration-300 ${step.done ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : step.active ? "border-primary bg-primary/10 text-primary ring-4 ring-primary/10" : "border-border bg-background/50 text-muted-foreground"}`, children: step.done ? "✓" : step.n }),
        /* @__PURE__ */ jsx("span", { className: `mt-1 text-[10px] font-mono uppercase tracking-wider text-center leading-tight ${step.done ? "text-emerald-400" : step.active ? "text-foreground" : "text-muted-foreground"}`, children: step.label }),
        i < arr.length - 1 && /* @__PURE__ */ jsx("div", { className: `w-0.5 h-12 mt-1 mb-1 transition-all duration-500 ${step.done ? "bg-emerald-500" : "bg-border/40"}` })
      ] }, step.n)) }),
      /* @__PURE__ */ jsxs("main", { className: "flex-1 py-12", children: [
        /* @__PURE__ */ jsxs("header", { className: "mb-14 max-w-3xl animate-entry", children: [
          /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest mb-4", style: {
            background: "rgba(124,58,237,0.12)",
            border: "1px solid rgba(124,58,237,0.25)",
            color: "#a78bfa"
          }, children: [
            /* @__PURE__ */ jsx("span", { className: "size-1.5 rounded-full bg-violet-400 animate-pulse" }),
            "AI-Powered · YouTube · TikTok · Reels"
          ] }),
          /* @__PURE__ */ jsxs("h1", { className: "font-display text-5xl md:text-7xl uppercase tracking-tighter leading-[0.92] mb-5", children: [
            "Extraia",
            " ",
            /* @__PURE__ */ jsx("span", { style: {
              background: "linear-gradient(135deg, #a78bfa, #7c3aed, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }, children: "virais" }),
            /* @__PURE__ */ jsx("br", {}),
            "do seu conteúdo longo"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground text-lg max-w-xl leading-relaxed", children: [
            "Cole a transcrição. A IA identifica hooks, cliffhangers e picos de retenção — devolve 5 clipes prontos pra ",
            /* @__PURE__ */ jsx("span", { className: "text-red-400 font-semibold", children: "YouTube" }),
            ", ",
            /* @__PURE__ */ jsx("span", { className: "text-pink-400 font-semibold", children: "TikTok" }),
            " e Reels."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20 animate-entry", children: [
          /* @__PURE__ */ jsxs("div", { className: "lg:col-span-8", children: [
            /* @__PURE__ */ jsx("label", { className: "font-display text-xs uppercase tracking-widest text-muted-foreground mb-2 block", children: "Importar do YouTube" }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-4", children: [
              /* @__PURE__ */ jsx("input", { type: "url", value: sourceUrl, onChange: (e) => setSourceUrl(e.target.value), placeholder: "Cole o link do YouTube (vídeo ou Short)", className: "flex-1 input-base" }),
              /* @__PURE__ */ jsx("button", { onClick: () => fetchMutation.mutate(), disabled: !sourceUrl.trim() || fetchMutation.isPending, className: "btn btn-ghost shrink-0 px-5 py-3 text-[11px]", children: fetchMutation.isPending ? "Buscando..." : "Importar" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mb-6 rounded-2xl p-5", style: {
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)"
            }, children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4 flex-wrap gap-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex rounded-xl overflow-hidden border border-white/10", style: {
                  background: "rgba(0,0,0,0.3)"
                }, children: [
                  /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setChannelTab("youtube"), className: `flex items-center gap-2 px-4 py-2 text-[11px] font-mono font-semibold uppercase tracking-widest transition-all cursor-pointer ${channelTab === "youtube" ? "text-white" : "text-muted-foreground hover:text-red-400"}`, style: channelTab === "youtube" ? {
                    background: "rgba(204,0,0,0.85)"
                  } : {}, children: [
                    /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-3 fill-current", children: /* @__PURE__ */ jsx("path", { d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" }) }),
                    "YouTube (",
                    youtubeProfiles.length,
                    ")"
                  ] }),
                  /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setChannelTab("tiktok"), className: `flex items-center gap-2 px-4 py-2 text-[11px] font-mono font-semibold uppercase tracking-widest transition-all cursor-pointer ${channelTab === "tiktok" ? "text-white" : "text-muted-foreground hover:text-pink-400"}`, style: channelTab === "tiktok" ? {
                    background: "linear-gradient(135deg, #fe2c55, #010101)"
                  } : {}, children: [
                    /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-3 fill-current", children: /* @__PURE__ */ jsx("path", { d: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.35 6.34 6.34 0 006.34-6.35V9.01a8.27 8.27 0 004.85 1.56V7.12a4.85 4.85 0 01-1.09-.43z" }) }),
                    "TikTok (",
                    tiktokProfiles.length,
                    ")"
                  ] })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono text-muted-foreground", children: channelTab === "youtube" ? "Autenticação OAuth2 via Google" : "Upload semi-automático via Creator Studio" })
              ] }),
              channelTab === "youtube" && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-4", children: [
                  /* @__PURE__ */ jsx("input", { type: "text", value: newProfileName, onChange: (e) => setNewProfileName(e.target.value), onKeyDown: (e) => e.key === "Enter" && handleAddProfile(), placeholder: "Nome do canal (ex: Canal Futebol)", className: "flex-1 input-base" }),
                  /* @__PURE__ */ jsx("button", { type: "button", onClick: handleAddProfile, className: "btn btn-primary shrink-0", children: "+ Adicionar" })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "space-y-2", children: youtubeProfiles.map((profile) => {
                  const isEditing = editingProfileName === profile.name;
                  return /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-xl", style: {
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)"
                  }, children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 flex-wrap", children: [
                      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex items-center gap-2", children: [
                        /* @__PURE__ */ jsx("span", { className: "size-2 rounded-full", style: {
                          backgroundColor: profile.refreshToken ? "#10b981" : "#6b7280"
                        } }),
                        /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold", children: profile.name }),
                        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-muted-foreground", children: profile.refreshToken ? `Conectado · ${profile.privacyStatus || "private"}` : "Não conectado" })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
                        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => handleConnectProfile(profile.name), className: `btn ${profile.refreshToken ? "btn-success" : "btn-youtube"}`, children: profile.refreshToken ? "Reconectar" : "Conectar Google" }),
                        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => isEditing ? handleSaveProfileSettings(profile.name) : handleStartEditProfile(profile), className: "btn btn-ghost", children: isEditing ? "Salvar" : "Config" }),
                        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => handleRemoveProfile(profile.name), className: "btn btn-danger", children: "✕" })
                      ] })
                    ] }),
                    isEditing && /* @__PURE__ */ jsxs("div", { className: "mt-3 pt-3 border-t border-white/[0.06] grid gap-2 grid-cols-1 sm:grid-cols-3", children: [
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx("label", { className: "font-mono text-[9px] text-muted-foreground uppercase block mb-1", children: "Hashtags" }),
                        /* @__PURE__ */ jsx("input", { type: "text", value: editingHashtags, onChange: (e) => setEditingHashtags(e.target.value), placeholder: "#shorts,#viral", className: "input-base text-[11px] py-1.5" })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx("label", { className: "font-mono text-[9px] text-muted-foreground uppercase block mb-1", children: "Tags SEO" }),
                        /* @__PURE__ */ jsx("input", { type: "text", value: editingTags, onChange: (e) => setEditingTags(e.target.value), placeholder: "tag1,tag2", className: "input-base text-[11px] py-1.5" })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx("label", { className: "font-mono text-[9px] text-muted-foreground uppercase block mb-1", children: "Privacidade" }),
                        /* @__PURE__ */ jsxs("select", { value: editingPrivacy, onChange: (e) => setEditingPrivacy(e.target.value), className: "input-base text-[11px] py-1.5 cursor-pointer", children: [
                          /* @__PURE__ */ jsx("option", { value: "private", children: "Privado" }),
                          /* @__PURE__ */ jsx("option", { value: "public", children: "Público" }),
                          /* @__PURE__ */ jsx("option", { value: "unlisted", children: "Não Listado" })
                        ] })
                      ] })
                    ] })
                  ] }, profile.name);
                }) }),
                /* @__PURE__ */ jsxs("p", { className: "mt-3 text-[10px] font-mono text-muted-foreground/50", children: [
                  "Redirect URI: ",
                  /* @__PURE__ */ jsx("span", { className: "text-violet-400", children: redirectUri || "Carregando..." })
                ] })
              ] }),
              channelTab === "tiktok" && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "mb-4 p-3 rounded-xl text-xs font-mono", style: {
                  background: "rgba(254,44,85,0.07)",
                  border: "1px solid rgba(254,44,85,0.18)"
                }, children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
                  /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-4 fill-pink-400 shrink-0 mt-0.5", children: /* @__PURE__ */ jsx("path", { d: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.35 6.34 6.34 0 006.34-6.35V9.01a8.27 8.27 0 004.85 1.56V7.12a4.85 4.85 0 01-1.09-.43z" }) }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "text-pink-400 font-semibold mb-1", children: "Upload Semi-Automático (Seguro)" }),
                    /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground leading-relaxed", children: [
                      "O TikTok não possui API de upload pública. Ao clicar em ",
                      /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: '"Subir TikTok"' }),
                      " em um job pronto, o ",
                      /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Creator Studio" }),
                      " abre automaticamente no browser — você só precisa fazer o upload. Você pode ter ",
                      /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "múltiplos perfis" }),
                      " e logar em contas diferentes simultaneamente usando perfis do Chrome/Edge separados."
                    ] })
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-2 mb-4", children: [
                  /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: [
                    /* @__PURE__ */ jsx("input", { type: "text", value: newTikTokProfileName, onChange: (e) => setNewTikTokProfileName(e.target.value), placeholder: "Nome do perfil (ex: Humor TT)", className: "input-base" }),
                    /* @__PURE__ */ jsx("input", { type: "text", value: newTikTokHashtags, onChange: (e) => setNewTikTokHashtags(e.target.value), placeholder: "#shorts,#tiktok,#viral", className: "input-base" })
                  ] }),
                  /* @__PURE__ */ jsxs("button", { type: "button", onClick: handleAddTikTokProfile, className: "btn btn-tiktok w-full justify-center py-2.5", children: [
                    /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-3.5 fill-current", children: /* @__PURE__ */ jsx("path", { d: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.35 6.34 6.34 0 006.34-6.35V9.01a8.27 8.27 0 004.85 1.56V7.12a4.85 4.85 0 01-1.09-.43z" }) }),
                    "Adicionar Perfil TikTok"
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "space-y-2", children: tiktokProfiles.map((profile) => /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-xl flex items-center justify-between gap-2 flex-wrap", style: {
                  background: "rgba(254,44,85,0.05)",
                  border: "1px solid rgba(254,44,85,0.14)"
                }, children: [
                  /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-3.5 fill-pink-500 shrink-0", children: /* @__PURE__ */ jsx("path", { d: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.35 6.34 6.34 0 006.34-6.35V9.01a8.27 8.27 0 004.85 1.56V7.12a4.85 4.85 0 01-1.09-.43z" }) }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold", children: profile.name }),
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-muted-foreground", children: profile.defaultHashtags })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
                      window.open("https://www.tiktok.com/login", "_blank");
                      toast.info(`Faça login no TikTok como "${profile.name}" no browser que abriu.`);
                    }, className: "btn btn-tiktok", children: "Abrir TikTok" }),
                    /* @__PURE__ */ jsx("button", { type: "button", onClick: () => handleRemoveTikTokProfile(profile.name), className: "btn btn-danger", children: "✕" })
                  ] })
                ] }, profile.name)) })
              ] })
            ] }),
            /* @__PURE__ */ jsx("label", { className: "font-display text-xs uppercase tracking-widest text-muted-foreground mb-2 block", children: "Raw Transcript" }),
            /* @__PURE__ */ jsx("textarea", { value: transcript, onChange: (e) => setTranscript(e.target.value), className: "w-full h-80 bg-surface border border-border rounded-xl p-6 font-mono text-sm leading-relaxed focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/40", placeholder: PLACEHOLDER }),
            /* @__PURE__ */ jsxs("div", { className: "mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground flex justify-between", children: [
              /* @__PURE__ */ jsxs("span", { children: [
                transcript.length.toLocaleString(),
                " caracteres"
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                transcript.trim().split(/\s+/).filter(Boolean).length.toLocaleString(),
                " palavras"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "lg:col-span-4 flex flex-col gap-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "font-display text-xs uppercase tracking-widest text-muted-foreground mb-2 block", children: "Título do vídeo" }),
              /* @__PURE__ */ jsx("input", { type: "text", value: videoTitle, onChange: (e) => setVideoTitle(e.target.value), placeholder: "Ex: Entrevista sobre IA 2026", className: "w-full bg-surface border border-border rounded-lg px-4 py-3 font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "font-display text-xs uppercase tracking-widest text-muted-foreground mb-2 block", children: "Plataforma" }),
              /* @__PURE__ */ jsxs("select", { value: platform, onChange: (e) => setPlatform(e.target.value), className: "w-full bg-surface border border-border rounded-lg px-4 py-3 font-medium outline-none focus:border-primary cursor-pointer", children: [
                /* @__PURE__ */ jsx("option", { children: "TikTok/Reels (9:16)" }),
                /* @__PURE__ */ jsx("option", { children: "YouTube Shorts" }),
                /* @__PURE__ */ jsx("option", { children: "LinkedIn Video" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "font-display text-xs uppercase tracking-widest text-muted-foreground mb-2 block", children: "Tom" }),
              /* @__PURE__ */ jsxs("select", { value: tone, onChange: (e) => setTone(e.target.value), className: "w-full bg-surface border border-border rounded-lg px-4 py-3 font-medium outline-none focus:border-primary cursor-pointer", children: [
                /* @__PURE__ */ jsx("option", { children: "Alta Energia" }),
                /* @__PURE__ */ jsx("option", { children: "Controverso / Provocativo" }),
                /* @__PURE__ */ jsx("option", { children: "Educacional / Limpo" }),
                /* @__PURE__ */ jsx("option", { children: "Emocional / Inspirador" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-2xl", style: {
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.25)"
            }, children: [
              /* @__PURE__ */ jsx("h3", { className: "font-display text-xl uppercase mb-2", children: "Pro Engine v4.2" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-6", children: "Analisa hooks, picos de retenção e justificativa viral com base em gatilhos comprovados de TikTok/Reels." }),
              /* @__PURE__ */ jsx("button", { onClick: () => mutation.mutate(), disabled: !canAnalyze, className: "w-full font-display text-base py-4 rounded-xl transition-all active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed", style: {
                background: canAnalyze ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "rgba(124,58,237,0.3)",
                color: "#fff",
                boxShadow: canAnalyze ? "0 12px 32px -8px rgba(124,58,237,0.7)" : "none",
                border: "1px solid rgba(124,58,237,0.4)"
              }, children: mutation.isPending ? "⚡ ANALISANDO..." : "⚡ ANALISAR CONTEÚDO" }),
              transcript.trim().length > 0 && transcript.trim().length < 50 && /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs text-destructive", children: "Mínimo de 50 caracteres na transcrição." })
            ] })
          ] })
        ] }),
        (clips.length > 0 || mutation.isPending) && /* @__PURE__ */ jsxs("section", { id: "results", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end mb-8 border-b border-border pb-4 gap-4 flex-wrap", children: [
            /* @__PURE__ */ jsxs("h2", { className: "font-display text-3xl md:text-4xl uppercase tracking-tighter italic", children: [
              "Top Viral Clips ",
              clips.length > 0 && /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                "(",
                String(clips.length).padStart(2, "0"),
                ")"
              ] })
            ] }),
            clips.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
              /* @__PURE__ */ jsx("button", { onClick: () => exportInstructions(clips, videoTitle, videoId, platform), className: "btn btn-ghost", children: "↓ Exportar (.txt)" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => renderMutation.mutate(), disabled: !canCreateJob || renderMutation.isPending, className: "btn btn-primary", children: renderMutation.isPending ? "Criando job..." : "⚡ Renderizar no PC" })
            ] })
          ] }),
          clips.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-8 rounded-3xl border border-primary/20 bg-surface p-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Local render worker" }),
                /* @__PURE__ */ jsx("h3", { className: "font-display text-2xl mt-2", children: "Crie o job e deixe o worker rodar" }),
                /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground max-w-2xl", children: "O worker local corta o vídeo e publica no YouTube. Se faltar alguma credencial, o erro aparece abaixo no job." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-right", children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Formato" }),
                /* @__PURE__ */ jsx("div", { className: "rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary", children: renderFormat })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-background p-4", children: [
                /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: "Plataforma" }),
                /* @__PURE__ */ jsx("div", { className: "mt-2 font-semibold", children: platform })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-background p-4", children: [
                /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: "Vídeo" }),
                /* @__PURE__ */ jsx("div", { className: "mt-2 font-semibold truncate", children: sourceUrl || "Sem link" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-background p-4", children: [
                /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: "Clipes" }),
                /* @__PURE__ */ jsx("div", { className: "mt-2 font-semibold", children: clips.length })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-background p-4", children: [
                /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: "Status" }),
                /* @__PURE__ */ jsx("div", { className: "mt-2 font-semibold", children: youtubeAuthLabel }),
                /* @__PURE__ */ jsx("div", { className: "mt-1 text-sm text-muted-foreground", children: youtubeAuthHint })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "font-display text-xs uppercase tracking-widest text-muted-foreground block mb-1", children: "Canal de Destino (YouTube)" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Os clipes serão renderizados localmente e enviados automaticamente para o canal selecionado." })
              ] }),
              /* @__PURE__ */ jsxs("select", { value: selectedProfile, onChange: (e) => setSelectedProfile(e.target.value), className: "bg-background border border-border rounded-xl px-4 py-2.5 font-mono text-xs text-foreground min-w-[240px] outline-none focus:border-primary cursor-pointer", children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Apenas local (Sem upload automático)" }),
                youtubeProfiles.filter((p) => p.refreshToken).map((p) => /* @__PURE__ */ jsxs("option", { value: p.name, children: [
                  "📺 ",
                  p.name
                ] }, p.name))
              ] })
            ] }),
            youtubeRefreshToken && /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-widest text-primary", children: "YOUTUBE_REFRESH_TOKEN" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-1 font-mono text-xs break-all text-muted-foreground", children: youtubeRefreshToken })
                ] }),
                /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
                  navigator.clipboard.writeText(youtubeRefreshToken);
                  toast.success("Token copiado! Cole no .env do worker.py");
                }, className: "shrink-0 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-primary hover:bg-primary/20", children: "Copiar" })
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "mt-2 text-[11px] text-muted-foreground", children: [
                "Cole no ",
                /* @__PURE__ */ jsx("code", { className: "font-mono", children: ".env" }),
                " do worker.py como ",
                /* @__PURE__ */ jsx("code", { className: "font-mono", children: "YOUTUBE_REFRESH_TOKEN=..." }),
                " e defina ",
                /* @__PURE__ */ jsx("code", { className: "font-mono", children: "YOUTUBE_AUTO_PUBLISH=true" }),
                "."
              ] })
            ] }),
            !sourceUrl.trim() && /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm text-destructive", children: "Para renderizar localmente, o job precisa de um link de vídeo válido." })
          ] }),
          videoId && playing && (() => {
            const vertical = platform.includes("9:16") || platform.includes("Shorts");
            return /* @__PURE__ */ jsxs("div", { id: "player", className: "mb-8 bg-surface border border-primary/40 rounded-2xl p-4 sticky top-20 z-40 shadow-2xl shadow-primary/10", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 mr-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "font-mono text-[10px] uppercase tracking-widest text-primary mb-1", children: [
                    "▶ ",
                    vertical ? "Preview 9:16" : "Preview 16:9",
                    " · ",
                    Math.max(1, playing.end - playing.start),
                    "s · ",
                    platform
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "font-display text-sm truncate", children: playing.title })
                ] }),
                /* @__PURE__ */ jsx("button", { onClick: () => setPlaying(null), className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary px-3 py-1 border border-border rounded transition-colors", children: "Fechar" })
              ] }),
              vertical ? /* @__PURE__ */ jsx("div", { className: "flex justify-center bg-black/60 rounded-lg py-4", children: /* @__PURE__ */ jsxs("div", { className: "relative bg-black rounded-2xl overflow-hidden border-2 border-border", style: {
                width: 280,
                height: 498
              }, children: [
                /* @__PURE__ */ jsx("iframe", { src: `https://www.youtube.com/embed/${videoId}?start=${playing.start}&end=${playing.end}&autoplay=1&rel=0&modestbranding=1&controls=0`, title: playing.title, allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowFullScreen: true, className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", style: {
                  width: 886,
                  height: 498
                } }, `${playing.start}-${playing.end}-v`),
                /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none", children: /* @__PURE__ */ jsx("div", { className: "font-display text-white text-sm uppercase tracking-tight line-clamp-2 drop-shadow-lg", children: playing.title }) }),
                /* @__PURE__ */ jsx("div", { className: "absolute top-2 right-2 px-2 py-0.5 bg-primary text-primary-foreground rounded font-mono text-[9px] uppercase tracking-widest", children: "9:16" })
              ] }) }) : /* @__PURE__ */ jsx("div", { className: "relative w-full", style: {
                aspectRatio: "16 / 9"
              }, children: /* @__PURE__ */ jsx("iframe", { src: `https://www.youtube.com/embed/${videoId}?start=${playing.start}&end=${playing.end}&autoplay=1&rel=0&modestbranding=1`, title: playing.title, allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowFullScreen: true, className: "absolute inset-0 w-full h-full rounded-lg border border-border" }, `${playing.start}-${playing.end}`) }),
              /* @__PURE__ */ jsxs("p", { className: "mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60", children: [
                vertical ? "Simulação do crop 9:16 · Renderize no CapCut com os timestamps" : "O player pausa automaticamente no fim do clipe",
                " · ",
                playing.start,
                "s → ",
                playing.end,
                "s"
              ] })
            ] });
          })(),
          mutation.isPending && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start", children: Array.from({
            length: 5
          }).map((_, i) => /* @__PURE__ */ jsxs("div", { className: "bg-surface border border-border rounded-2xl p-6 h-80 animate-pulse", style: {
            animationDelay: `${i * 100}ms`
          }, children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between mb-6", children: [
              /* @__PURE__ */ jsx("div", { className: "size-16 rounded-full border-4 border-border" }),
              /* @__PURE__ */ jsx("div", { className: "h-4 w-24 bg-border rounded" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-6 w-3/4 bg-border rounded mb-3" }),
            /* @__PURE__ */ jsx("div", { className: "h-3 w-full bg-border rounded mb-2" }),
            /* @__PURE__ */ jsx("div", { className: "h-3 w-2/3 bg-border rounded" })
          ] }, i)) }),
          clips.length > 0 && !mutation.isPending && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start", children: clips.map((clip, idx) => /* @__PURE__ */ jsx(ClipCard, { clip, index: idx, thumbnailConfig: clipThumbnailConfigs[idx], onThumbnailSave: (dataUrl, config) => handleSaveThumbnail(idx, dataUrl, config), youtubeThumbnailDataUrl, preRenderedDataUrl: clip.thumbnailDataUrl, onClipEdit: (idx2, updated) => {
            setClips((prev) => {
              const next = [...prev];
              next[idx2] = {
                ...updated,
                thumbnailDataUrl: void 0
              };
              return next;
            });
            setClipThumbnails((prev) => {
              const next = {
                ...prev
              };
              delete next[idx2];
              return next;
            });
            setClipThumbnailConfigs((prev) => {
              const next = {
                ...prev
              };
              delete next[idx2];
              return next;
            });
          }, onPlay: videoId ? (c) => {
            setPlaying({
              start: parseTimestampToSeconds(c.startTimestamp),
              end: parseTimestampToSeconds(c.endTimestamp),
              title: c.title
            });
            setTimeout(() => {
              document.getElementById("player")?.scrollIntoView({
                behavior: "smooth",
                block: "center"
              });
            }, 50);
          } : void 0 }, idx)) })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "mt-14 rounded-3xl border border-border bg-surface p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Fila de renderização" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-2 flex-wrap", children: [
                /* @__PURE__ */ jsx("h2", { className: "font-display text-3xl", children: "Jobs locais" }),
                /* @__PURE__ */ jsxs("div", { className: `inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-medium ${workerStatus.color}`, children: [
                  /* @__PURE__ */ jsxs("span", { className: "relative flex h-1.5 w-1.5", children: [
                    /* @__PURE__ */ jsx("span", { className: `${workerStatus.glow} absolute inline-flex h-full w-full rounded-full opacity-75` }),
                    /* @__PURE__ */ jsx("span", { className: `relative inline-flex rounded-full h-1.5 w-1.5 ${workerStatus.dotBg}` })
                  ] }),
                  workerStatus.label
                ] })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground max-w-2xl", children: "O status é atualizado pelo worker local. Atualize a lista sempre que quiser ver o progresso." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-wrap items-center", children: [
              /* @__PURE__ */ jsx("button", { onClick: () => clearOldJobsMutation.mutate(), disabled: clearOldJobsMutation.isPending || !jobs.some((j) => ["done", "completed", "failed"].includes(j.status)), className: "btn btn-danger", children: clearOldJobsMutation.isPending ? "Limpando..." : "Limpar Histórico" }),
              /* @__PURE__ */ jsx("button", { onClick: () => fetchJobs(), className: "btn btn-ghost", children: "↻ Atualizar" })
            ] })
          ] }),
          (youtubeProfiles.length > 0 || tiktokProfiles.length > 0) && /* @__PURE__ */ jsx("div", { className: "mt-5 p-4 rounded-2xl", style: {
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)"
          }, children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 flex-wrap", children: [
            /* @__PURE__ */ jsx("span", { className: "font-mono text-[9px] uppercase tracking-widest text-muted-foreground shrink-0 mt-1.5", children: "Destino:" }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 flex-1", children: [
              /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
                setSelectedProfile("");
                setSelectedTikTokProfile("");
              }, className: `inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full transition-all cursor-pointer ${!selectedProfile && !selectedTikTokProfile ? "bg-white/10 border border-white/25 text-foreground" : "border border-white/10 text-muted-foreground hover:border-white/20"}`, children: [
                /* @__PURE__ */ jsx("span", { className: "size-1.5 rounded-full bg-white/30" }),
                "Sem upload"
              ] }),
              youtubeProfiles.map((p) => {
                const isActive = selectedProfile === p.name;
                const ok = Boolean(p.refreshToken);
                return /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
                  if (!ok) {
                    toast.error(`"${p.name}" não autenticado`);
                    return;
                  }
                  setSelectedProfile(isActive ? "" : p.name);
                  setSelectedTikTokProfile("");
                }, className: `inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full transition-all cursor-pointer ${isActive ? "text-white" : ok ? "border border-white/10 text-muted-foreground hover:border-red-500/30 hover:text-red-400" : "border border-white/[0.07] text-white/20 cursor-not-allowed"}`, style: isActive ? {
                  background: "rgba(204,0,0,0.9)",
                  border: "1px solid rgba(204,0,0,0.4)"
                } : {}, children: [
                  /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-2.5 fill-current", children: /* @__PURE__ */ jsx("path", { d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" }) }),
                  p.name,
                  !ok && /* @__PURE__ */ jsx("span", { className: "text-[8px] opacity-50", children: "✕" })
                ] }, `yt-${p.name}`);
              }),
              tiktokProfiles.map((p) => {
                const isActive = selectedTikTokProfile === p.name;
                return /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
                  setSelectedTikTokProfile(isActive ? "" : p.name);
                  setSelectedProfile("");
                }, className: `inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full transition-all cursor-pointer ${isActive ? "text-white" : "border border-pink-500/20 text-pink-400/60 hover:border-pink-500/40 hover:text-pink-400"}`, style: isActive ? {
                  background: "linear-gradient(135deg, #fe2c55, #1a1a1a)",
                  border: "1px solid rgba(254,44,85,0.5)"
                } : {}, children: [
                  /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-2.5 fill-current", children: /* @__PURE__ */ jsx("path", { d: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.35 6.34 6.34 0 006.34-6.35V9.01a8.27 8.27 0 004.85 1.56V7.12a4.85 4.85 0 01-1.09-.43z" }) }),
                  p.name
                ] }, `tt-${p.name}`);
              }),
              (selectedProfile || selectedTikTokProfile) && /* @__PURE__ */ jsxs("span", { className: "ml-auto text-[10px] font-mono text-muted-foreground flex items-center gap-1", children: [
                "Próximo job → ",
                selectedProfile ? `YT: ${selectedProfile}` : `TT: ${selectedTikTokProfile}`
              ] })
            ] })
          ] }) }),
          processingJob && /* @__PURE__ */ jsxs("div", { className: "mt-6 rounded-3xl border border-primary/30 bg-primary/5 p-6 shadow-[0_8px_32px_0_rgba(120,119,198,0.08)] backdrop-blur-sm relative overflow-hidden", children: [
            /* @__PURE__ */ jsxs("div", { className: "absolute top-0 right-0 p-3 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-primary bg-primary/10 rounded-bl-2xl", children: [
              /* @__PURE__ */ jsxs("span", { className: "relative flex h-2 w-2", children: [
                /* @__PURE__ */ jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" }),
                /* @__PURE__ */ jsx("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-primary" })
              ] }),
              "Processando"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-widest text-primary", children: "Job Ativo" }),
                /* @__PURE__ */ jsx("h3", { className: "font-display text-2xl mt-1 text-foreground truncate max-w-xl", children: processingJob.video_title || processingJob.video_url }),
                /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-muted-foreground font-mono", children: [
                  "ID: ",
                  processingJob.id,
                  " · ",
                  processingJob.platform,
                  " · ",
                  processingJob.render_format
                ] }),
                /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-muted-foreground font-mono", children: formatElapsedTime(processingJob.locked_at || processingJob.created_at) ? `Tempo decorrido: ${formatElapsedTime(processingJob.locked_at || processingJob.created_at)}` : "Tempo decorrido indisponível" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 text-left md:text-right", children: [
                /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
                  if (confirm("Deseja realmente reiniciar este job?")) {
                    retryMutation.mutate(processingJob.id);
                  }
                }, disabled: retryMutation.isPending, className: "btn btn-warning", children: retryMutation.isPending ? "Reiniciando..." : "Reiniciar" }),
                /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
                  if (confirm("Deseja realmente excluir este job ativo?")) {
                    deleteMutation.mutate(processingJob.id);
                  }
                }, disabled: deleteMutation.isPending, className: "btn btn-danger", children: deleteMutation.isPending ? "Excluindo..." : "Excluir" }),
                /* @__PURE__ */ jsx("span", { className: "inline-flex rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary border border-primary/20", children: getQueueJobLabel(processingJob) })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-6", children: (() => {
              const progressMsg = processingJob.output_path?.includes("Progress:") ? processingJob.output_path.split(" | ").find((p) => p.includes("Progress:"))?.replace("Progress:", "").trim() : null;
              const queueStage = jobQueueStage(processingJob);
              const statusMsg = progressMsg ?? queueStage.label;
              const isYoutubeUpload = progressMsg?.includes("YouTube") || processingJob.status === "published_requested";
              return /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-xs font-mono mb-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Progresso do Processamento" }),
                  /* @__PURE__ */ jsxs("span", { className: `animate-pulse font-medium ${isYoutubeUpload ? "text-red-400" : "text-primary"}`, children: [
                    isYoutubeUpload ? "⬆ " : "⚙ ",
                    statusMsg
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "h-2 w-full bg-surface border border-border rounded-full overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: `h-full rounded-full animate-pulse w-full ${isYoutubeUpload ? "bg-red-500" : "bg-primary"}` }) }),
                /* @__PURE__ */ jsxs("div", { className: "mt-3 flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-widest", children: [
                  /* @__PURE__ */ jsx("span", { className: `rounded-full border px-2.5 py-1 ${processingJob.status === "pending" ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : "border-border bg-background/40 text-muted-foreground"}`, children: processingJob.status === "pending" ? "Pending: aguardando worker" : "Pending" }),
                  /* @__PURE__ */ jsx("span", { className: `rounded-full border px-2.5 py-1 ${processingJob.status === "published_requested" ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-border bg-background/40 text-muted-foreground"}`, children: processingJob.status === "published_requested" ? "Publish: aguardando envio" : "Publish" }),
                  /* @__PURE__ */ jsx("span", { className: `rounded-full border px-2.5 py-1 ${processingJob.status === "in_progress" ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-background/40 text-muted-foreground"}`, children: processingJob.status === "in_progress" ? "In progress" : "In progress" })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "mt-4 grid grid-cols-3 gap-2 text-[10px] font-mono uppercase tracking-widest", children: [{
                  n: 1,
                  label: "Job recebido"
                }, {
                  n: 2,
                  label: "Enviado ao worker"
                }, {
                  n: 3,
                  label: "Processando"
                }].map((step) => {
                  const active = queueStage.index === step.n;
                  const done = queueStage.index > step.n || processingJob.status === "done" || processingJob.status === "completed";
                  return /* @__PURE__ */ jsxs("div", { className: `rounded-xl border px-3 py-2 text-center transition-colors ${done ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : active ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-background/40 text-muted-foreground"}`, children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[9px] mb-1", children: String(step.n).padStart(2, "0") }),
                    /* @__PURE__ */ jsx("div", { children: step.label })
                  ] }, step.n);
                }) }),
                progressMsg && /* @__PURE__ */ jsxs("div", { className: "mt-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs font-mono text-primary flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "animate-spin text-base", children: "⟳" }),
                  /* @__PURE__ */ jsx("span", { children: progressMsg })
                ] })
              ] });
            })() })
          ] }),
          youtubePublishedClips.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-6", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "size-7 rounded-lg flex items-center justify-center", style: {
                background: "linear-gradient(135deg, #FF0000 0%, #cc0000 100%)"
              }, children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-4 fill-white", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" }) }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "font-display text-lg tracking-tight", children: "Publicados no YouTube" }),
                /* @__PURE__ */ jsxs("p", { className: "text-[10px] font-mono uppercase tracking-widest text-muted-foreground", children: [
                  youtubePublishedClips.length,
                  " clipe",
                  youtubePublishedClips.length !== 1 ? "s" : "",
                  " enviado",
                  youtubePublishedClips.length !== 1 ? "s" : ""
                ] })
              ] })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", children: youtubePublishedClips.map((clip, idx) => /* @__PURE__ */ jsxs("a", { href: clip.url, target: "_blank", rel: "noopener noreferrer", className: "group block rounded-2xl overflow-hidden border border-border/60 bg-background/50 hover:border-red-500/40 hover:bg-red-500/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/10", children: [
              /* @__PURE__ */ jsxs("div", { className: "relative aspect-video bg-surface overflow-hidden", children: [
                clip.videoId ? /* @__PURE__ */ jsx("img", { src: `https://img.youtube.com/vi/${clip.videoId}/mqdefault.jpg`, alt: clip.title, className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300", onError: (e) => {
                  e.target.style.display = "none";
                } }) : /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center bg-surface", children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-10 opacity-20 fill-current", children: /* @__PURE__ */ jsx("path", { d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" }) }) }),
                /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30", children: /* @__PURE__ */ jsx("div", { className: "size-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg", children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-5 fill-white ml-0.5", children: /* @__PURE__ */ jsx("path", { d: "M8 5v14l11-7z" }) }) }) }),
                /* @__PURE__ */ jsxs("div", { className: "absolute top-2 left-2 bg-black/70 rounded-md px-1.5 py-0.5 font-mono text-[9px] text-white uppercase tracking-widest", children: [
                  "Clipe ",
                  idx + 1
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-3", children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold text-sm text-foreground line-clamp-2 group-hover:text-red-400 transition-colors leading-snug", children: clip.title }),
                /* @__PURE__ */ jsx("div", { className: "mt-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono", children: /* @__PURE__ */ jsx("span", { className: "truncate max-w-[140px]", children: clip.jobTitle }) }),
                /* @__PURE__ */ jsx("div", { className: "mt-1 text-[10px] text-muted-foreground font-mono", children: new Date(clip.publishedAt).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit"
                }) })
              ] })
            ] }, `${clip.jobId}-${idx}`)) })
          ] }),
          tiktokPublishedClips.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-6 border-t border-border/40 pt-6", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "size-7 rounded-lg flex items-center justify-center bg-black border border-pink-500/30", children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-4 fill-pink-500", children: /* @__PURE__ */ jsx("path", { d: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.35 6.34 6.34 0 006.34-6.35V9.01a8.27 8.27 0 004.85 1.56V7.12a4.85 4.85 0 01-1.09-.43z" }) }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "font-display text-lg tracking-tight", children: "Publicados no TikTok" }),
                /* @__PURE__ */ jsxs("p", { className: "text-[10px] font-mono uppercase tracking-widest text-muted-foreground", children: [
                  tiktokPublishedClips.length,
                  " clipe",
                  tiktokPublishedClips.length !== 1 ? "s" : "",
                  " enviado",
                  tiktokPublishedClips.length !== 1 ? "s" : ""
                ] })
              ] })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", children: tiktokPublishedClips.map((clip, idx) => /* @__PURE__ */ jsxs("div", { className: "group block rounded-2xl overflow-hidden border border-border/60 bg-background/50 hover:border-pink-500/40 hover:bg-pink-500/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-500/10", children: [
              /* @__PURE__ */ jsxs("div", { className: "relative aspect-video bg-surface overflow-hidden flex items-center justify-center", children: [
                /* @__PURE__ */ jsx("div", { className: "size-10 rounded-full bg-pink-500/10 flex items-center justify-center border border-pink-500/20", children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-5 fill-pink-500", children: /* @__PURE__ */ jsx("path", { d: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.35 6.34 6.34 0 006.34-6.35V9.01a8.27 8.27 0 004.85 1.56V7.12a4.85 4.85 0 01-1.09-.43z" }) }) }),
                /* @__PURE__ */ jsxs("div", { className: "absolute top-2 left-2 bg-black/70 rounded-md px-1.5 py-0.5 font-mono text-[9px] text-white uppercase tracking-widest", children: [
                  "Clipe ",
                  idx + 1
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-3", children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold text-sm text-foreground line-clamp-2 leading-snug", children: clip.title }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground font-mono", children: [
                  /* @__PURE__ */ jsx("span", { className: "truncate max-w-[120px]", children: clip.jobTitle }),
                  /* @__PURE__ */ jsx("span", { className: "text-pink-400 font-bold bg-pink-500/5 px-1.5 py-0.5 rounded border border-pink-500/10", children: clip.profileName })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "mt-1 text-[10px] text-muted-foreground font-mono", children: new Date(clip.publishedAt).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit"
                }) })
              ] })
            ] }, `${clip.jobId}-${idx}`)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col gap-3", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1", children: "Histórico de Jobs" }),
            historyJobs.map((job) => {
              const jobYoutubeLinks = extractYoutubeLinks(job.output_path);
              const clipItems = job.clip_items || [];
              return /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-2xl border border-border/60 bg-background/50 hover:bg-background/80 hover:border-border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm", children: [
                /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                    /* @__PURE__ */ jsxs("span", { className: "font-mono text-[9px] uppercase tracking-widest text-muted-foreground", children: [
                      "Job ",
                      job.id.slice(0, 8)
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground font-mono", children: new Date(job.created_at).toLocaleString("pt-BR") })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "mt-1 font-semibold text-foreground truncate", children: job.video_title || job.video_url }),
                  /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-0.5 font-mono", children: [
                    job.platform,
                    " · ",
                    job.render_format,
                    " · Out: ",
                    /* @__PURE__ */ jsx("span", { className: "text-foreground/80 break-all", children: job.output_path || "N/A" })
                  ] }),
                  jobYoutubeLinks.length > 0 && clipItems.length === 0 && /* @__PURE__ */ jsxs("div", { className: "mt-2.5 flex flex-wrap gap-1.5 items-center", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-muted-foreground uppercase tracking-widest mr-1", children: "YouTube:" }),
                    jobYoutubeLinks.map((link, idx) => /* @__PURE__ */ jsxs("a", { href: link, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-[11px] font-mono text-red-400 font-semibold transition-colors cursor-pointer", children: [
                      /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-3 fill-current", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" }) }),
                      "Clipe ",
                      idx + 1
                    ] }, idx))
                  ] }),
                  extractTikTokPublishInfo(job.output_path) && clipItems.length === 0 && /* @__PURE__ */ jsxs("div", { className: "mt-2.5 flex flex-wrap gap-1.5 items-center", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-muted-foreground uppercase tracking-widest mr-1", children: "TikTok:" }),
                    /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/25 text-[11px] font-mono text-pink-400 font-semibold", children: [
                      /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-2.5 fill-current", children: /* @__PURE__ */ jsx("path", { d: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.35 6.34 6.34 0 006.34-6.35V9.01a8.27 8.27 0 004.85 1.56V7.12a4.85 4.85 0 01-1.09-.43z" }) }),
                      extractTikTokPublishInfo(job.output_path)
                    ] })
                  ] }),
                  clipItems.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-4 border-t border-border/30 pt-3 space-y-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-mono text-[9px] uppercase tracking-widest text-muted-foreground block mb-2", children: "PUBLICAR CLIPES INDIVIDUALMENTE:" }),
                    /* @__PURE__ */ jsx("div", { className: "grid gap-2 grid-cols-1 xl:grid-cols-2", children: clipItems.map((clip, clipIdx) => {
                      const ytUrl = clip.youtube_url;
                      const ttProfileName = clip.tiktok_profile;
                      const connectedProfiles = youtubeProfiles.filter((p) => p.refreshToken);
                      return /* @__PURE__ */ jsxs("div", { className: "bg-background/30 border border-border/40 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3", children: [
                        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ jsxs("span", { className: "font-mono text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded", children: [
                              "CLIPE ",
                              clipIdx + 1
                            ] }),
                            /* @__PURE__ */ jsxs("span", { className: "font-mono text-[9px] text-muted-foreground", children: [
                              clip.startTimestamp,
                              " → ",
                              clip.endTimestamp
                            ] })
                          ] }),
                          /* @__PURE__ */ jsx("div", { className: "font-semibold text-xs text-foreground truncate mt-1", children: clip.title })
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1.5 shrink-0", children: [
                          ytUrl ? /* @__PURE__ */ jsxs("a", { href: ytUrl, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-[10px] font-mono text-red-400 font-semibold cursor-pointer transition-colors", children: [
                            /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-2.5 fill-current", children: /* @__PURE__ */ jsx("path", { d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" }) }),
                            "YouTube ↗"
                          ] }) : isJobReadyToPublish(job.status) && connectedProfiles.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "relative inline-block text-left", children: [
                            /* @__PURE__ */ jsx("button", { type: "button", disabled: publishMutation.isPending, className: "btn btn-youtube px-2 py-1 text-[10px] rounded flex items-center gap-1 font-mono cursor-pointer", onClick: () => {
                              const key = `${job.id}-${clipIdx}-yt`;
                              setOpenYoutubeDropdown(openYoutubeDropdown === key ? null : key);
                              setOpenTiktokDropdown(null);
                            }, children: "YouTube ▾" }),
                            openYoutubeDropdown === `${job.id}-${clipIdx}-yt` && /* @__PURE__ */ jsxs("div", { className: "absolute left-0 bottom-full mb-1 w-40 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden font-mono text-[10px]", children: [
                              /* @__PURE__ */ jsx("div", { className: "px-2 py-1 bg-background border-b border-border text-[8px] uppercase tracking-widest text-muted-foreground", children: "Canal:" }),
                              connectedProfiles.map((p) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
                                publishMutation.mutate({
                                  jobId: job.id,
                                  clipIndex: clipIdx,
                                  profile: p
                                });
                                setOpenYoutubeDropdown(null);
                              }, className: "w-full text-left px-2 py-1.5 hover:bg-primary hover:text-white transition-colors flex items-center justify-between cursor-pointer", children: /* @__PURE__ */ jsx("span", { children: p.name }) }, p.name))
                            ] })
                          ] }) : /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/30 font-mono py-1", children: "YouTube N/A" }),
                          ttProfileName ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-2.5 py-1 rounded bg-pink-500/10 border border-pink-500/20 text-[10px] font-mono text-pink-400 font-semibold", children: [
                            /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-2.5 fill-current", children: /* @__PURE__ */ jsx("path", { d: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.35 6.34 6.34 0 006.34-6.35V9.01a8.27 8.27 0 004.85 1.56V7.12a4.85 4.85 0 01-1.09-.43z" }) }),
                            "TikTok (",
                            ttProfileName,
                            ")"
                          ] }) : isJobReadyToPublish(job.status) && tiktokProfiles.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "relative inline-block text-left", children: [
                            /* @__PURE__ */ jsx("button", { type: "button", disabled: publishTiktokMutation.isPending, className: "btn btn-tiktok px-2 py-1 text-[10px] rounded flex items-center gap-1 font-mono cursor-pointer", onClick: () => {
                              const key = `${job.id}-${clipIdx}-tt`;
                              setOpenTiktokDropdown(openTiktokDropdown === key ? null : key);
                              setOpenYoutubeDropdown(null);
                            }, children: "TikTok ▾" }),
                            openTiktokDropdown === `${job.id}-${clipIdx}-tt` && /* @__PURE__ */ jsxs("div", { className: "absolute left-0 bottom-full mb-1 w-40 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden font-mono text-[10px]", children: [
                              /* @__PURE__ */ jsx("div", { className: "px-2 py-1 bg-background border-b border-border text-[8px] uppercase tracking-widest text-muted-foreground", children: "Perfil:" }),
                              tiktokProfiles.map((p) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
                                publishTiktokMutation.mutate({
                                  jobId: job.id,
                                  clipIndex: clipIdx,
                                  profile: p
                                });
                                setOpenTiktokDropdown(null);
                              }, className: "w-full text-left px-2 py-1.5 hover:bg-primary hover:text-white transition-colors flex items-center justify-between cursor-pointer", children: /* @__PURE__ */ jsx("span", { children: p.name }) }, p.name))
                            ] })
                          ] }) : /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/30 font-mono py-1", children: "TikTok N/A" })
                        ] })
                      ] }, clipIdx);
                    }) })
                  ] }),
                  job.error_message && /* @__PURE__ */ jsxs("div", { className: "mt-1.5 text-xs text-destructive/90 font-mono bg-destructive/5 border border-destructive/10 rounded px-2 py-1 flex items-start gap-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-bold shrink-0", children: "Erro:" }),
                    /* @__PURE__ */ jsx("span", { className: "break-all", children: job.error_message })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 shrink-0 flex-wrap md:flex-nowrap", children: [
                  /* @__PURE__ */ jsx("span", { className: "rounded-full px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider border", style: {
                    backgroundColor: isJobSuccess(job.status) ? "rgba(16, 185, 129, 0.12)" : isJobPublishing(job.status) ? "rgba(245, 158, 11, 0.14)" : job.status === "failed" ? "rgba(239, 68, 68, 0.12)" : "rgba(59, 130, 246, 0.12)",
                    borderColor: isJobSuccess(job.status) ? "rgba(16, 185, 129, 0.25)" : isJobPublishing(job.status) ? "rgba(245, 158, 11, 0.3)" : job.status === "failed" ? "rgba(239, 68, 68, 0.25)" : "rgba(59, 130, 246, 0.25)",
                    color: isJobSuccess(job.status) ? "#10b981" : isJobPublishing(job.status) ? "#f59e0b" : job.status === "failed" ? "#ef4444" : "#3b82f6"
                  }, children: getJobStatusLabel(job.status) }),
                  isJobReadyToPublish(job.status) && (() => {
                    const connectedProfiles = youtubeProfiles.filter((p) => p.refreshToken);
                    const activeProfile = selectedProfile ? connectedProfiles.find((p) => p.name === selectedProfile) : null;
                    if (activeProfile) {
                      return /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => publishMutation.mutate({
                        jobId: job.id,
                        profile: activeProfile
                      }), disabled: publishMutation.isPending, className: "btn btn-youtube", children: [
                        /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-3 fill-current", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" }) }),
                        publishMutation.isPending ? "Subindo..." : `${activeProfile.name} (Tudo)`
                      ] });
                    }
                    if (connectedProfiles.length > 0) {
                      return /* @__PURE__ */ jsxs("div", { className: "relative inline-block text-left", children: [
                        /* @__PURE__ */ jsxs("button", { type: "button", disabled: publishMutation.isPending, className: "btn btn-youtube", onClick: () => {
                          setOpenYoutubeDropdown(openYoutubeDropdown === job.id ? null : job.id);
                          setOpenTiktokDropdown(null);
                        }, children: [
                          /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-3 fill-current", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" }) }),
                          publishMutation.isPending ? "Subindo..." : "YouTube (Tudo) ▾"
                        ] }),
                        openYoutubeDropdown === job.id && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 bottom-full mb-1 w-48 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden font-mono text-xs", children: [
                          /* @__PURE__ */ jsx("div", { className: "px-3 py-2 bg-background border-b border-border text-[9px] uppercase tracking-widest text-muted-foreground", children: "Escolha o Canal:" }),
                          connectedProfiles.map((p) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
                            publishMutation.mutate({
                              jobId: job.id,
                              profile: p
                            });
                            setOpenYoutubeDropdown(null);
                          }, className: "w-full text-left px-3 py-2 hover:bg-primary hover:text-white transition-colors flex items-center justify-between cursor-pointer", children: /* @__PURE__ */ jsx("span", { children: p.name }) }, p.name))
                        ] })
                      ] });
                    }
                    return null;
                  })(),
                  isJobReadyToPublish(job.status) && (() => {
                    const activeTikTokProfile = selectedTikTokProfile ? tiktokProfiles.find((p) => p.name === selectedTikTokProfile) : null;
                    if (activeTikTokProfile) {
                      return /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => publishTiktokMutation.mutate({
                        jobId: job.id,
                        profile: activeTikTokProfile
                      }), disabled: publishTiktokMutation.isPending, className: "btn btn-tiktok", style: {
                        animation: "ttGlow 2s ease-in-out infinite"
                      }, children: [
                        /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-3 fill-current", children: /* @__PURE__ */ jsx("path", { d: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.35 6.34 6.34 0 006.34-6.35V9.01a8.27 8.27 0 004.85 1.56V7.12a4.85 4.85 0 01-1.09-.43z" }) }),
                        publishTiktokMutation.isPending ? "Subindo..." : `${activeTikTokProfile.name} (Tudo)`
                      ] });
                    }
                    if (tiktokProfiles.length > 0) {
                      return /* @__PURE__ */ jsxs("div", { className: "relative inline-block text-left", children: [
                        /* @__PURE__ */ jsxs("button", { type: "button", disabled: publishTiktokMutation.isPending, className: "btn btn-tiktok", onClick: () => {
                          setOpenTiktokDropdown(openTiktokDropdown === job.id ? null : job.id);
                          setOpenYoutubeDropdown(null);
                        }, children: [
                          /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-3 fill-current", children: /* @__PURE__ */ jsx("path", { d: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.35 6.34 6.34 0 006.34-6.35V9.01a8.27 8.27 0 004.85 1.56V7.12a4.85 4.85 0 01-1.09-.43z" }) }),
                          publishTiktokMutation.isPending ? "Subindo..." : "TikTok (Tudo) ▾"
                        ] }),
                        openTiktokDropdown === job.id && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 bottom-full mb-1 w-48 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden font-mono text-xs", children: [
                          /* @__PURE__ */ jsx("div", { className: "px-3 py-2 bg-background border-b border-border text-[9px] uppercase tracking-widest text-muted-foreground", children: "Escolha o Perfil:" }),
                          tiktokProfiles.map((p) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
                            publishTiktokMutation.mutate({
                              jobId: job.id,
                              profile: p
                            });
                            setOpenTiktokDropdown(null);
                          }, className: "w-full text-left px-3 py-2 hover:bg-primary hover:text-white transition-colors flex items-center justify-between cursor-pointer", children: /* @__PURE__ */ jsx("span", { children: p.name }) }, p.name))
                        ] })
                      ] });
                    }
                    return null;
                  })(),
                  job.status === "failed" && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => retryMutation.mutate(job.id), disabled: retryMutation.isPending, className: "btn btn-warning", children: retryMutation.isPending ? "Reiniciando..." : "Tentar Novamente" }),
                  /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
                    if (confirm("Deseja realmente excluir este job?")) {
                      deleteMutation.mutate(job.id);
                    }
                  }, disabled: deleteMutation.isPending, className: "btn btn-danger", children: deleteMutation.isPending ? "..." : "Excluir" })
                ] })
              ] }, job.id);
            }),
            historyJobs.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-center py-6 text-xs text-muted-foreground font-mono uppercase tracking-widest border border-dashed border-border rounded-2xl", children: "Nenhum job finalizado no histórico" })
          ] })
        ] }),
        clips.length === 0 && !mutation.isPending && /* @__PURE__ */ jsx("section", { className: "mt-24 grid grid-cols-1 md:grid-cols-4 gap-8 border-t border-border pt-12", children: [{
          n: "01",
          t: "Hook",
          d: "Frase de impacto nos primeiros 3s"
        }, {
          n: "02",
          t: "Contexto",
          d: "Autoexplicativo, sem vídeo original"
        }, {
          n: "03",
          t: "Valor",
          d: "Lição, opinião forte ou emoção"
        }, {
          n: "04",
          t: "Fechamento",
          d: "Cliffhanger ou loop satisfatório"
        }].map((item) => /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "font-mono text-xs text-primary mb-2", children: item.n }),
          /* @__PURE__ */ jsx("h3", { className: "font-display text-2xl uppercase mb-2", children: item.t }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: item.d })
        ] }, item.n)) })
      ] })
    ] }),
    " ",
    /* @__PURE__ */ jsx("footer", { className: "border-t border-border py-8 px-6 mt-24", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto flex justify-between items-center", children: [
      /* @__PURE__ */ jsx("span", { className: "font-mono text-xs text-muted-foreground uppercase tracking-widest", children: "ViralForce.AI © 2026" }),
      /* @__PURE__ */ jsx("span", { className: "font-mono text-xs text-muted-foreground", children: "Powered by Lovable AI" })
    ] }) }),
    showWorkerModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in", children: /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-2xl bg-surface border border-primary/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-primary/20 animate-scale-up", style: {
      background: "linear-gradient(180deg, rgba(19, 19, 32, 0.95) 0%, rgba(9, 9, 15, 0.98) 100%)"
    }, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "size-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-xl font-bold", children: "🚀" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-display text-2xl tracking-tight", children: "Job Criado com Sucesso!" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs font-mono uppercase tracking-widest text-primary mt-0.5", children: "Ação Necessária" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowWorkerModal(false), className: "text-muted-foreground hover:text-foreground text-sm font-mono px-3 py-1.5 border border-border rounded-xl transition-all", children: "[ Fechar ]" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed mb-6 font-mono", children: [
        "⚠️ O site enviou o seu pedido para a fila, mas você precisa iniciar o ",
        /* @__PURE__ */ jsx("strong", { children: "Worker Local" }),
        " no seu computador para que ele possa baixar, cortar o vídeo e publicar."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 mb-8", children: [
        /* @__PURE__ */ jsx("h4", { className: "text-xs uppercase tracking-widest text-muted-foreground font-mono", children: "Passo a Passo para Iniciar" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "size-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-mono text-xs font-bold text-primary shrink-0 mt-0.5", children: "1" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "Abra a pasta do projeto no seu PC" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Vá até o diretório onde o código está salvo:" }),
            /* @__PURE__ */ jsx("code", { className: "block mt-1 p-2 rounded bg-background border border-border font-mono text-[10.5px] select-all", children: "c:\\Users\\user\\Desktop\\hook-hustle-engine" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "size-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-mono text-xs font-bold text-primary shrink-0 mt-0.5", children: "2" }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "Inicie o Worker (Escolha uma opção)" }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 mt-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "p-3.5 rounded-2xl border border-border bg-background/40 hover:border-primary/20 transition-all", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-emerald-400", children: "Opção A (Recomendada - Silenciosa)" }),
                /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground mt-1 leading-normal", children: "Dê dois cliques no arquivo:" }),
                /* @__PURE__ */ jsx("code", { className: "block mt-1 font-mono text-[10px] text-primary", children: "INICIAR_TRABALHO_SILENCIOSO.vbs" }),
                /* @__PURE__ */ jsx("p", { className: "text-[9.5px] text-muted-foreground mt-1", children: "O worker rodará em segundo plano, sem abrir janelas." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-3.5 rounded-2xl border border-border bg-background/40 hover:border-primary/20 transition-all", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-primary", children: "Opção B (Pelo terminal - Com Logs)" }),
                /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground mt-1 leading-normal", children: "Abra o terminal na pasta do projeto e digite:" }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mt-1 bg-background p-1.5 rounded border border-border", children: [
                  /* @__PURE__ */ jsx("code", { className: "font-mono text-[10px] truncate select-all", children: "python worker.py" }),
                  /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
                    navigator.clipboard.writeText("python worker.py");
                    toast.success("Comando copiado!");
                  }, className: "text-[9px] font-mono px-1.5 py-0.5 bg-primary/20 text-primary rounded border border-primary/30", children: "Copiar" })
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "size-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-mono text-xs font-bold text-primary shrink-0 mt-0.5", children: "3" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "Acompanhe o processamento" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: 'O worker processa a fila a cada 15 segundos. O status do job mudará de "na fila" para "processando" automaticamente.' })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-end gap-3 pt-4 border-t border-border/60", children: /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowWorkerModal(false), className: "btn btn-primary px-6 py-2.5 font-display text-sm uppercase tracking-wider cursor-pointer", children: "Entendi, vou iniciar! 👍" }) })
    ] }) })
  ] });
}
export {
  Index as component
};
