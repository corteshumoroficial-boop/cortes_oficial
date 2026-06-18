import { useEffect, useRef } from "react";
import type { ViralClip, ClipTrigger } from "@/lib/clips.functions";
import {
  getViralPreset,
  type ThumbnailEnhancements,
} from "@/lib/thumbnail-effects";

export interface ThumbnailConfig {
  titleText: string;
  subText: string;
  colorScheme: string; // "humor" | "controversy" | "emotional" | "hook" | "high_value" | "cliffhanger"
  emoji: string;
  showScore: boolean;
  textPosition: "top" | "center" | "bottom";
  // New enhancement options
  enhancements?: ThumbnailEnhancements;
  useViralEffects?: boolean; // Enable aggressive viral effects
}

interface ThumbnailCanvasProps {
  clip: ViralClip;
  config?: ThumbnailConfig;
  onExport?: (dataUrl: string) => void;
  width?: number; // Visual width for scaling preview
  youtubeThumbnailDataUrl?: string | null;
  isPreRendered?: boolean;
}

export const COLOR_SCHEMES: Record<string, { colors: [string, string]; emoji: string; label: string }> = {
  humor: { colors: ["#FF4500", "#FFD700"], emoji: "😂", label: "Humor" }, // More saturated orange
  controversy: { colors: ["#FF0000", "#FF6600"], emoji: "🤯", label: "Controvérsia" }, // Pure red to orange
  emotional: { colors: ["#6B0066", "#FF00FF"], emoji: "❤️", label: "Emocional" }, // Deep purple to magenta
  hook: { colors: ["#0066FF", "#00CCFF"], emoji: "👀", label: "Gancho" }, // Bright blue to cyan
  high_value: { colors: ["#00CC00", "#00FF00"], emoji: "💎", label: "Alto Valor" }, // Lime green
  cliffhanger: { colors: ["#FF6600", "#FFAA00"], emoji: "🔥", label: "Suspense" }, // Orange to amber
};

export function getDefaultConfig(clip: ViralClip): ThumbnailConfig {
  const mainTrigger = clip.triggers[0] || "hook";
  const scheme = COLOR_SCHEMES[mainTrigger] ? mainTrigger : "hook";
  
  // Determine badge based on score
  const determineBadge = (score: number) => {
    if (score >= 95) return "trending" as const;
    if (score >= 85) return "hot" as const;
    if (score >= 75) return "new" as const;
    return "score" as const;
  };

  // Use viral preset for maximum engagement
  const enhancements = getViralPreset(mainTrigger);
  
  return {
    titleText: clip.title,
    subText: clip.hookQuote || "",
    colorScheme: scheme,
    emoji: COLOR_SCHEMES[scheme]?.emoji || "👀",
    showScore: true,
    textPosition: "center",
    enhancements,
    useViralEffects: true, // Enable viral effects by default
  };
}

export function ThumbnailCanvas({ clip, config, onExport, width = 320, youtubeThumbnailDataUrl, isPreRendered }: ThumbnailCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Calculate scaled height for 16:9 ratio
  const height = Math.round((width * 9) / 16);
  
  const currentConfig = config || getDefaultConfig(clip);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isCancelled = false;

    const drawCanvas = (bgImg: HTMLImageElement | null) => {
      if (isCancelled) return;
      // 1. Reset and Clear Canvas (Native resolution: 1280x720)
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

      const schemeInfo = COLOR_SCHEMES[currentConfig.colorScheme] || COLOR_SCHEMES.hook;

      // 2. Background (Image or Gradient)
      if (bgImg) {
        // Draw YouTube thumbnail practically UNTOUCHED (like real YouTube)
        ctx.drawImage(bgImg, 0, 0, 1280, 720);

        // Black-to-transparent linear gradient overlay from X=0 to X=700 for high text contrast
        const leftGrad = ctx.createLinearGradient(0, 0, 700, 0);
        leftGrad.addColorStop(0, "rgba(0, 0, 0, 0.8)");
        leftGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.6)");
        leftGrad.addColorStop(0.9, "rgba(0, 0, 0, 0.1)");
        leftGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        
        ctx.fillStyle = leftGrad;
        ctx.fillRect(0, 0, 700, 720);
      } else {
        // Fallback: Solid Dark Navy Blue Background (#0B0D22) matching professional template
        ctx.fillStyle = "#0B0D22";
        ctx.fillRect(0, 0, 1280, 720);
      }

      // Add outer glow effect (subtle darkening towards edges)
      const outerGlow = ctx.createRadialGradient(640, 360, 400, 640, 360, 900);
      outerGlow.addColorStop(0, "rgba(0, 0, 0, 0)");
      outerGlow.addColorStop(0.7, "rgba(0, 0, 0, 0.2)");
      outerGlow.addColorStop(1, "rgba(0, 0, 0, 0.6)");
      ctx.fillStyle = outerGlow;
      ctx.fillRect(0, 0, 1280, 720);

      // 5. Score Badge (Top Right) - SIMPLE and clean like YouTube
      if (currentConfig.showScore) {
        ctx.save();
        const bx = 1130;
        const by = 110;
        const radius = 65;

        // Simple circle badge with score
        ctx.beginPath();
        ctx.arc(bx, by, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)"; // semi-transparent dark
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Score Value - simple and clean
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "900 50px 'Outfit', 'Montserrat', 'Inter', sans-serif";
        ctx.fillText(clip.score.toString(), bx, by - 8);

        // Score Label
        ctx.font = "bold 12px 'Outfit', 'Montserrat', 'Inter', sans-serif";
        ctx.fillStyle = "#ffff00";
        ctx.fillText("VIRAL", bx, by + 28);
        ctx.restore();
      }

      // 6. Draw Text (Title & Subtitle) - Aligned with professional composite
      ctx.save();
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      
      const titleText = (currentConfig.titleText || clip.title || "SEU TÍTULO").toUpperCase();
      const subTextValue = currentConfig.subText || "";

      let titleFontSize = 95; // Giant font initial
      let subFontSize = 48; // Legível initial
      let titleLines: string[] = [];
      let subLines: string[] = [];
      let titleLineHeight = 0;
      let subLineHeight = 0;
      let totalTextHeight = 0;
      let totalTitleHeight = 0;
      let totalSubHeight = 0;
      const textGap = 35;
      const maxTextWidth = 590; // Strictly keep within left side (X=0 to X=650)

      // Loop para adaptar o tamanho da fonte e não vazar a tela (limite de altura ~580px)
      for (let attempt = 0; attempt < 6; attempt++) {
        ctx.font = `900 ${titleFontSize}px 'Outfit', 'Montserrat', 'Inter', 'Segoe UI', sans-serif`;
        titleLineHeight = titleFontSize * 1.1;
        titleLines = wrapText(ctx, titleText, maxTextWidth);
        
        ctx.font = `italic 700 ${subFontSize}px 'Outfit', 'Montserrat', 'Inter', 'Segoe UI', sans-serif`;
        subLineHeight = subFontSize * 1.25;
        subLines = subTextValue ? wrapText(ctx, `"${subTextValue}"`, maxTextWidth) : [];
        
        totalTitleHeight = titleLines.length * titleLineHeight;
        totalSubHeight = subLines.length > 0 ? (subLines.length * subLineHeight) + textGap : 0;
        totalTextHeight = totalTitleHeight + totalSubHeight;
        
        if (totalTextHeight <= 580) {
          break; // Cabeu!
        }
        
        // Reduz em 15% para a próxima tentativa
        titleFontSize = Math.floor(titleFontSize * 0.85);
        subFontSize = Math.floor(subFontSize * 0.85);
      }
      
      let startY = 120; // Default top
      if (currentConfig.textPosition === "center" || totalTextHeight < 400) {
        startY = (720 - totalTextHeight) / 2;
      } else if (currentConfig.textPosition === "bottom") {
        startY = 720 - 120 - totalTextHeight;
      }
      
      // Draw Title Lines
      titleLines.forEach((line, idx) => {
        const lineY = startY + idx * titleLineHeight;
        
        ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 6;
        
        ctx.strokeStyle = "#000000";
        // A espessura da linha fina para design limpo
        ctx.lineWidth = Math.max(2, Math.floor(titleFontSize * 0.04)); 
        ctx.font = `900 ${titleFontSize}px 'Montserrat', 'Outfit', 'Inter', 'Segoe UI', sans-serif`;
        ctx.strokeText(line, 60, lineY);
        
        ctx.fillStyle = "#FFEB3B"; // Vibrant Yellow fill
        ctx.fillText(line, 60, lineY);
      });
      
      // Draw Subtitle Lines (Subtext)
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
          
          ctx.fillStyle = "#ffffff"; // White fill
          ctx.fillText(line, 60, lineY);
        });
      }

      ctx.restore();

      // 6.5 Logo marca d'agua no canto inferior direito
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

      // 7. Trigger Export callback
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

  // Helper to wrap text
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split(" ");
    const lines: string[] = [];
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

  return (
    <div 
      className="relative overflow-hidden rounded-xl bg-slate-950 border border-border flex items-center justify-center"
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        aspectRatio: "16 / 9"
      }}
    >
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
}
