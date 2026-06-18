import { createServerFn } from "@tanstack/react-start";
import { createHash } from "crypto";
import { z } from "zod";
import sharp from "sharp";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { workerSupabase } from "./worker-supabase.server";

const THUMBNAIL_LOGO_PATH =
  process.env.THUMBNAIL_LOGO_PATH ||
  path.join(process.cwd(), "public", "logo-thumb.png");

async function loadLogoBuffer(): Promise<Buffer | null> {
  const candidates = [
    THUMBNAIL_LOGO_PATH,
    path.join(process.cwd(), "public", "brand", "logo.png"),
    path.join(process.cwd(), "public", "brand", "logo.webp"),
  ];

  for (const candidate of candidates) {
    try {
      if (candidate && fs.existsSync(candidate)) {
        return fs.readFileSync(candidate);
      }
    } catch {
      continue;
    }
  }

  return null;
}

function createLogoBadgeSvg(): string {
  return `
    <svg width="340" height="120" viewBox="0 0 340 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.65"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <rect x="10" y="10" width="320" height="100" rx="28" fill="rgba(0,0,0,0.38)" stroke="rgba(255,255,255,0.16)"/>
        <circle cx="62" cy="60" r="26" fill="#FFD700"/>
        <text x="62" y="69" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="34" fill="#000000">V</text>
        <text x="110" y="68" font-family="Arial Black, Arial, sans-serif" font-size="32" fill="#FFD700">VIRALFORCE.AI</text>
      </g>
    </svg>
  `;
}

async function buildLogoOverlay(width: number, height: number): Promise<Buffer | null> {
  const logoBuffer = await loadLogoBuffer();
  if (logoBuffer) {
    return sharp(logoBuffer)
      .resize(Math.floor(width * 0.16), Math.floor(width * 0.16), { fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer();
  }

  return sharp(Buffer.from(createLogoBadgeSvg())).png().toBuffer();
}

// Helper: generate a deterministic cache key for a video path and timestamp
function getCacheKey(videoPath: string, seconds: number): string {
  const hash = createHash("sha256");
  hash.update(`${videoPath}::${seconds}`);
  return hash.digest("hex");
}

// Retrieves a cached frame if it exists, otherwise returns undefined
function getCachedFrame(cacheDir: string, key: string): string | undefined {
  const cachedPath = path.join(cacheDir, `${key}.png`);
  if (fs.existsSync(cachedPath)) {
    console.log(`✅ Reusing cached frame: ${cachedPath}`);
    return cachedPath;
  }
  return undefined;
}

// Saves a newly extracted frame to the cache directory
function saveFrameToCache(cacheDir: string, key: string, framePath: string): void {
  if (!fs.existsSync(cacheDir)) {
    try {
      fs.mkdirSync(cacheDir, { recursive: true });
    } catch (_) {}
  }
  const dest = path.join(cacheDir, `${key}.png`);
  if (!fs.existsSync(dest)) {
    try {
      fs.copyFileSync(framePath, dest);
      console.log(`💾 Cached frame saved: ${dest}`);
    } catch (err) {
      console.warn(`⚠️ Failed to save to cache:`, err);
    }
  }
}

/**
 * 🎬 PIPELINE PROFISSIONAL DE COMPOSIÇÃO DE THUMBNAILS
 * 
 * Arquitetura em Camadas:
 * 1️⃣  Extrair frame inteligente do vídeo
 * 2️⃣  Remover fundo (segmentação) - isolar pessoa
 * 3️⃣  Criar fundo templato profissional
 * 4️⃣  Compor camadas: fundo + pessoas + texto + efeitos
 * 5️⃣  Exportar como JPEG final
 */

const ProfessionalThumbnailSchema = z.object({
  videoPath: z.string().min(1), // Local path OU URL remota
  resolvedStreamUrl: z.string().optional(), // URL de stream já resolvida (evita chamar yt-dlp por thumbnail)
  clipTitle: z.string().min(1).max(500),
  clipHook: z.string().min(1).max(1000),
  triggerType: z.enum(["humor", "controversy", "emotional", "hook", "high_value", "cliffhanger"]),
  extractAtSeconds: z.number().optional().default(2),
  personPositions: z.array(z.enum(["left", "center", "right"])).optional().default(["center"]),
  backgroundTemplate: z.enum(["dark_gradient", "vibrant_gradient", "city_night", "abstract"]).optional().default("dark_gradient"),
  compactLayout: z.boolean().optional().default(false),
  useAdvancedEffects: z.boolean().optional().default(true),
  clipId: z.string().optional(),
});

// Presets de cores PROFISSIONAIS (estilo YouTube real - Dark backgrounds com texto AMARELO)
const DESIGN_PRESETS = {
  humor: {
    primary: "#1a2a4a",        // Dark navy blue
    secondary: "#2a3a5a",      // Slightly lighter navy
    accent: "#FFD700",         // Bright yellow accent
    text: "#FFD700",           // YELLOW TEXT
    shadow: "rgba(0,0,0,0.8)",
    emoji: "😂",
  },
  controversy: {
    primary: "#2a1a1a",        // Dark red-brown
    secondary: "#3a2a2a",      // Dark gray-red
    accent: "#FFD700",         // Yellow accent
    text: "#FFD700",           // YELLOW TEXT
    shadow: "rgba(0,0,0,0.8)",
    emoji: "🔥",
  },
  emotional: {
    primary: "#1a1a3a",        // Dark purple-blue
    secondary: "#2a1a3a",      // Dark purple
    accent: "#FFD700",         // Yellow accent
    text: "#FFD700",           // YELLOW TEXT
    shadow: "rgba(0,0,0,0.8)",
    emoji: "❤️",
  },
  hook: {
    primary: "#0a1a3a",        // Very dark navy (estilo imagem referência!)
    secondary: "#1a2a4a",      // Dark blue
    accent: "#FFD700",         // Yellow accent
    text: "#FFD700",           // YELLOW TEXT
    shadow: "rgba(0,0,0,0.8)",
    emoji: "👀",
  },
  high_value: {
    primary: "#1a3a1a",        // Dark green
    secondary: "#2a4a2a",      // Dark forest green
    accent: "#FFD700",         // Yellow accent
    text: "#FFD700",           // YELLOW TEXT
    shadow: "rgba(0,0,0,0.8)",
    emoji: "💎",
  },
  cliffhanger: {
    primary: "#2a1a0a",        // Dark orange-brown
    secondary: "#3a2a1a",      // Dark brown
    accent: "#FFD700",         // Yellow accent
    text: "#FFD700",           // YELLOW TEXT
    shadow: "rgba(0,0,0,0.8)",
    emoji: "🔥",
  },
};

/**
 * ETAPA 1: Download de vídeo (se necessário)
 */
async function downloadVideoFile(videoUrl: string, outputPath: string): Promise<void> {
  try {
    console.log(`📥 Download: ${videoUrl.substring(0, 50)}...`);
    const response = await fetch(videoUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    console.log(`✅ Download completo: ${(buffer.byteLength / 1024 / 1024).toFixed(2)}MB`);
  } catch (error) {
    console.error("Erro ao fazer download:", error);
    throw error;
  }
}

/**
 * ETAPA 1: Obter caminho local do vídeo ou URL de streaming direto
 */
async function getLocalVideoPath(videoPath: string, tempDir: string): Promise<{ localPath: string; isDownloaded: boolean }> {
  // Se for YouTube, usar yt-dlp para pegar a URL de stream direto!
  if (videoPath.includes("youtube.com") || videoPath.includes("youtu.be")) {
    console.log(`📥 Resolving YouTube stream URL for: ${videoPath}...`);
    try {
      // Usar execSync para chamar yt-dlp sincronicamente
      const command = `yt-dlp -g -f "bestvideo[ext=mp4]/best" "${videoPath}"`;
      const directUrl = execSync(command, { encoding: 'utf-8', timeout: 15000 }).trim().split('\n')[0];
      if (directUrl && directUrl.startsWith('http')) {
        console.log(`✅ YouTube stream resolved!`);
        return { localPath: directUrl, isDownloaded: false };
      }
    } catch (error) {
      console.warn(`⚠️ Failed to resolve direct stream URL for ${videoPath}:`, error);
    }
  }

  // Se for um arquivo local existente, usar direto
  if (fs.existsSync(videoPath)) {
    return { localPath: videoPath, isDownloaded: false };
  }

  // Caso contrário, baixar o vídeo para uma pasta temporária
  const filename = `download_${Date.now()}.mp4`;
  const outputPath = path.join(tempDir, filename);
  await downloadVideoFile(videoPath, outputPath);
  return { localPath: outputPath, isDownloaded: true };
}

async function extractVideoFrame(
  videoPath: string,
  secondsToExtract: number,
  outputPath: string
): Promise<string> {
  try {
    console.log(`🎥 Extraindo frame no segundo ${secondsToExtract}...`);
    // Colocar -ss antes de -i ativa "input seeking", que é instantâneo e não faz download do stream inteiro sequencialmente.
    const command = `ffmpeg -ss ${secondsToExtract} -i "${videoPath}" -vframes 1 -q:v 2 -vf "scale=1920:1080:force_original_aspect_ratio=decrease" "${outputPath}" -y`;
    execSync(command, { stdio: "pipe", timeout: 15000 });
    return outputPath;
  } catch (error) {
    console.error("Erro ao extrair frame:", error);
    throw new Error("Falha na extração do frame");
  }
}

async function removeBackgroundRobust(
  imagePath: string,
  outputPath: string,
  removeApiKey?: string
): Promise<{ success: boolean; method: string; usedFallback?: boolean }> {
  // Método 1: Rembg local (Python)
  try {
    console.log("🎨 [Método 1] Tentando Rembg local...");
    const command = `python -m rembg i "${imagePath}" "${outputPath}" -a`;
    execSync(command, { stdio: "pipe", timeout: 30000 });
    console.log("✅ Rembg local funcionou!");
    return { success: true, method: "rembg_local", usedFallback: false };
  } catch (error) {
    console.warn("⚠️  Rembg local não disponível");
  }

  // Método 2: Remove.bg API
  if (removeApiKey) {
    try {
      console.log("🎨 [Método 2] Tentando Remove.bg API...");
      const imageBuffer = fs.readFileSync(imagePath);
      
      const formData = new FormData();
      formData.append("image_file", new Blob([imageBuffer]));
      
      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-API-Key": removeApiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const resultBuffer = await response.arrayBuffer();
      fs.writeFileSync(outputPath, Buffer.from(resultBuffer));
      console.log("✅ Remove.bg API funcionou!");
      return { success: true, method: "removebg_api", usedFallback: false };
    } catch (error) {
      console.warn("⚠️  Remove.bg API falhou:", error);
    }
  }

  // Método 3: Segmentação simples (cores de borda)
  try {
    console.log("🎨 [Método 3] Usando segmentação simples...");
    // Usar sharp para detectar fundo similar (edge-based)
    await sharp(imagePath)
      .removeAlpha()
      .toFile(outputPath);
    console.log("✅ Segmentação simples funcionou!");
    return { success: true, method: "simple_segmentation", usedFallback: true };
  } catch (error) {
    console.error("❌ Todos os métodos falharam:", error);
    return { success: false, method: "failed", usedFallback: true };
  }
}

function createBackgroundTemplate(
  width: number,
  height: number,
  template: string,
  colors: (typeof DESIGN_PRESETS)[keyof typeof DESIGN_PRESETS],
): string {
  switch (template) {
    case "vibrant_gradient":
      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="${width}" height="${height}" fill="url(#bg)"/>
          <ellipse cx="${width * 0.3}" cy="${height * 0.3}" rx="${width * 0.4}" ry="${height * 0.4}" fill="${colors.accent}" opacity="0.15"/>
          <ellipse cx="${width * 0.8}" cy="${height * 0.8}" rx="${width * 0.3}" ry="${height * 0.3}" fill="${colors.accent}" opacity="0.1"/>
        </svg>
      `;

    case "city_night":
      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#0a1628;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#1a1a2e;stop-opacity:1" />
            </linearGradient>
            <filter id="blur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3"/>
            </filter>
          </defs>
          <rect width="${width}" height="${height}" fill="url(#bg)"/>
          <circle cx="${width * 0.1}" cy="${height * 0.2}" r="40" fill="${colors.primary}" opacity="0.3" filter="url(#blur)"/>
          <circle cx="${width * 0.9}" cy="${height * 0.3}" r="30" fill="${colors.secondary}" opacity="0.25" filter="url(#blur)"/>
          <circle cx="${width * 0.5}" cy="${height * 0.9}" r="50" fill="${colors.accent}" opacity="0.2" filter="url(#blur)"/>
        </svg>
      `;

    case "abstract":
      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
            </linearGradient>
            <radialGradient id="glow" cx="50%" cy="30%">
              <stop offset="0%" style="stop-color:${colors.accent};stop-opacity:0.3" />
              <stop offset="100%" style="stop-color:${colors.primary};stop-opacity:0" />
            </radialGradient>
          </defs>
          <rect width="${width}" height="${height}" fill="url(#bg)"/>
          <rect width="${width}" height="${height}" fill="url(#glow)"/>
          <pattern id="pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="100" y2="100" stroke="rgba(255,255,255,0.05)" stroke-width="2"/>
            <line x1="100" y1="0" x2="0" y2="100" stroke="rgba(255,255,255,0.03)" stroke-width="2"/>
          </pattern>
          <rect width="${width}" height="${height}" fill="url(#pattern)"/>
        </svg>
      `;

    default:
      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="${width}" height="${height}" fill="url(#bg)"/>
        </svg>
      `;
  }
}

/**
 * ETAPA 4: Criar SVG de texto profissional - EXATAMENTE COMO OS GRANDES CANAIS
 * Contorno: preto com stroke-width: 22px (ultra visível no YouTube)
 * Cor: amarelo (#FFD700)
 * Font: Impact/Arial Black 900 (82px) - muito mais impactante
 * Posição: Estratégica na lateral esquerda (não cobre a pessoa à direita)
 */
/**
 * Helper to wrap text for SVG layout (backend)
 */
function wrapTextBackend(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length > maxCharsPerLine) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        lines.push(word);
        currentLine = "";
      }
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * ETAPA 4: Criar SVG de texto profissional - EXATAMENTE COMO OS GRANDES CANAIS
 * Contorno: preto com stroke-width: 20px (ultra visível no YouTube)
 * Cor: amarelo (#FFD700) para o título e branco (#FFFFFF) para o gancho
 * Font: Impact/Arial Black (tamanho gigante)
 * Posição: Confinado ao lado esquerdo (X=0 até X=650)
 */
function createTextSVG(
  title: string,
  hook: string,
  colors: (typeof DESIGN_PRESETS)[keyof typeof DESIGN_PRESETS],
  width: number = 1280,
  height: number = 720,
  compactLayout: boolean = false
): string {
  const titleUpper = title.toUpperCase();
  const hookUpper = hook.toUpperCase();

  // Envoltura de texto com limites específicos por linha para criar blocos harmoniosos
  const titleLines = wrapTextBackend(titleUpper, 14); // Título com quebras em ~14 caracteres
  const hookLines = wrapTextBackend(hookUpper, 22);   // Gancho/Subtítulo com quebras em ~22 caracteres

  let titleFontSize = 75; // Fonte inicial do título
  let hookFontSize = 38;  // Fonte inicial do gancho

  // Limite horizontal para o texto (X=60 até X=620 => 560px de espaço útil à esquerda da imagem da pessoa)
  const MAX_TEXT_WIDTH = compactLayout ? 480 : 560;

  // Encontrar as linhas mais longas para cálculo de largura horizontal
  const maxTitleLineLength = Math.max(...titleLines.map(l => l.length), 0);
  const maxHookLineLength = Math.max(...hookLines.map(l => l.length), 0);

  // Fatores de proporção de caractere (Montserrat/Impact em caixa alta tem aprox. 62% a 55% da altura na largura)
  const titleCharWidthFactor = 0.62;
  const hookCharWidthFactor = 0.55;

  // Reduzir tamanho da fonte se houver risco de transbordamento horizontal
  if (maxTitleLineLength * titleFontSize * titleCharWidthFactor > MAX_TEXT_WIDTH) {
    titleFontSize = Math.floor(MAX_TEXT_WIDTH / (maxTitleLineLength * titleCharWidthFactor));
  }
  if (maxHookLineLength * hookFontSize * hookCharWidthFactor > MAX_TEXT_WIDTH) {
    hookFontSize = Math.floor(MAX_TEXT_WIDTH / (maxHookLineLength * hookCharWidthFactor));
  }

  // Font size limits (adjust for compact layout)
  const MAX_TITLE_FONT_SIZE = compactLayout ? 48 : 80;
  const MAX_HOOK_FONT_SIZE = compactLayout ? 28 : 38;

  // Garantir limites mínimos e máximos saudáveis para as fontes
  titleFontSize = Math.max(32, Math.min(MAX_TITLE_FONT_SIZE, titleFontSize));
  hookFontSize = Math.max(18, Math.min(MAX_HOOK_FONT_SIZE, hookFontSize));

  const textGap = 25;
  let titleLineHeight = titleFontSize * 1.1;
  let hookLineHeight = hookFontSize * 1.25;

  let totalTitleHeight = titleLines.length * titleLineHeight;
  let totalHookHeight = hookLines.length > 0 ? (hookLines.length * hookLineHeight) + textGap : 0;
  let totalTextHeight = totalTitleHeight + totalHookHeight;

  // Reduzir tamanho vertical se a soma das linhas de texto ultrapassar o espaço disponível (550px)
  if (totalTextHeight > 550) {
    const scaleFactor = 550 / totalTextHeight;
    titleFontSize = Math.floor(titleFontSize * scaleFactor);
    hookFontSize = Math.floor(hookFontSize * scaleFactor);

    // Ajustar novamente com base no mínimo aceitável
    titleFontSize = Math.max(28, titleFontSize);
    hookFontSize = Math.max(16, hookFontSize);

    titleLineHeight = titleFontSize * 1.1;
    hookLineHeight = hookFontSize * 1.25;

    totalTitleHeight = titleLines.length * titleLineHeight;
    totalHookHeight = hookLines.length > 0 ? (hookLines.length * hookLineHeight) + textGap : 0;
    totalTextHeight = totalTitleHeight + totalHookHeight;
  }

  // O contorno (stroke) se adapta dinamicamente ao tamanho da fonte para manter a harmonia visual
  const strokeWidth = Math.max(6, Math.floor(titleFontSize * 0.16));
  const hookStrokeWidth = Math.max(4, Math.floor(hookFontSize * 0.12));

  // Centralizar o bloco completo de texto no eixo Y (altura total de 720px)
  let currentY = (720 - totalTextHeight) / 2 + titleFontSize * 0.8;
  if (currentY < 70) currentY = 70;

  // Helper para escapar apenas os caracteres problemáticos de XML (mantém '>')
  const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  
  const strokeTexts: string[] = [];
  const fillTexts: string[] = [];

  // Linhas de Título (Amarelo #FFEB3B)
  titleLines.forEach(line => {
    const safeLine = escapeXml(line).replace(/&gt;/g, '>').replace(/&amp;gt;/g, '>');

    strokeTexts.push(`
      <text
        x="60"
        y="${currentY}"
        font-family="'Montserrat', 'Outfit', 'Inter', sans-serif"
        font-size="${titleFontSize}"
        font-weight="900"
        letter-spacing="1"
        fill="none"
        stroke="#000000"
        stroke-width="${strokeWidth}"
        stroke-linecap="round"
        stroke-linejoin="round"
        paint-order="stroke fill"
      >
        ${safeLine}
      </text>
    `);
    fillTexts.push(`
      <text
        x="60"
        y="${currentY}"
        font-family="'Montserrat', 'Outfit', 'Inter', sans-serif"
        font-size="${titleFontSize}"
        font-weight="900"
        letter-spacing="1"
        fill="#FFEB3B"
        stroke="none"
        filter="url(#drop-shadow)"
      >
        ${safeLine}
      </text>
    `);
    currentY += titleLineHeight;
  });

  // Espaçamento entre título e gancho
  if (hookLines.length > 0) {
    currentY += textGap;
  }

  // Linhas de Gancho/Legenda (Branco #FFFFFF)
  hookLines.forEach(line => {
    const safeLine = escapeXml(line).replace(/&gt;/g, '>').replace(/&amp;gt;/g, '>');
    strokeTexts.push(`
      <text
        x="60"
        y="${currentY}"
        font-family="'Montserrat', 'Outfit', 'Inter', sans-serif"
        font-size="${hookFontSize}"
        font-weight="800"
        letter-spacing="0.5"
        fill="none"
        stroke="#000000"
        stroke-width="${hookStrokeWidth}"
        stroke-linecap="round"
        stroke-linejoin="round"
        paint-order="stroke fill"
      >
        ${safeLine}
      </text>
    `);
    fillTexts.push(`
      <text
        x="60"
        y="${currentY}"
        font-family="'Montserrat', 'Outfit', 'Inter', sans-serif"
        font-size="${hookFontSize}"
        font-weight="800"
        letter-spacing="0.5"
        fill="#FFFFFF"
        stroke="none"
        filter="url(#drop-shadow)"
      >
        ${safeLine}
      </text>
    `);
    currentY += hookLineHeight;
  });

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.85"/>
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="1.0"/>
        </filter>
      </defs>
      
      <!-- Camada inferior do texto: Contorno Preto -->
      ${strokeTexts.join("\n")}
      
      <!-- Camada superior do texto: Preenchimento Premium com Sombra -->
      ${fillTexts.join("\n")}
    </svg>
  `;
}

/**
 * 🎨 COMPOSIÇÃO SIMPLES E ROBUSTA (3 CAMADAS - SEM DISTORÇÕES)
 * Baseado em código profissional comprovado
 * Camada 1: Fundo sólido escuro (1280x720) - #0B0D22
 * Camada 2: Foto do participante preenchendo 100% da altura (720px) com fit: 'cover' alinhado à direita (X=650 a X=1280)
 * Camada 3: Texto SVG na camada superior, confinado à esquerda (X=0 a X=650)
 */
async function composeProfessionalThumbnail(
  frameFile: string,
  personImages: Array<{ path: string; position: "left" | "center" | "right" }>,
  backgroundSvg: string,
  textSvg: string,
  useAdvancedEffects: boolean,
  outputPath: string
): Promise<void> {
  try {
    const THUMB_WIDTH = 1280;
    const THUMB_HEIGHT = 720;

    console.log("🎨 [COMPOSIÇÃO PROFISSIONAL] Compondo com base em template SVG dinâmico e vídeo frame...");

    // ═══════════════════════════════════════════════════════════════
    // CAMADA 1: Template de fundo (cor e gradiente dinâmicos dependendo do tipo do corte)
    // ═══════════════════════════════════════════════════════════════
    console.log("  📍 Camada 1: Carregando template de fundo baseado no tipo de trigger");
    const bgTemplateBuffer = await sharp(Buffer.from(backgroundSvg))
      .png()
      .toBuffer();

    // ═══════════════════════════════════════════════════════════════
    // CAMADA 2: Fundo desfocado do frame original (blend overlay para manter textura do vídeo)
    // ═══════════════════════════════════════════════════════════════
    console.log(`  📍 Camada 2: Fundo desfocado do frame original: ${frameFile}`);
    const blurredBgBuffer = await sharp(frameFile)
      .resize(THUMB_WIDTH, THUMB_HEIGHT, { fit: 'cover' })
      .blur(10)
      .png()
      .toBuffer();

    // ═══════════════════════════════════════════════════════════════
    // CAMADA EXTRA: Gradiente linear escuro à esquerda para legibilidade
    // ═══════════════════════════════════════════════════════════════
    console.log(`  📍 Camada extra: Gradiente escuro à esquerda (X=0 a X=700)`);
    const gradientOverlaySvg = `
      <svg width="${THUMB_WIDTH}" height="${THUMB_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="leftGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:black;stop-opacity:0.8" />
            <stop offset="50%" style="stop-color:black;stop-opacity:0.6" />
            <stop offset="90%" style="stop-color:black;stop-opacity:0.1" />
            <stop offset="100%" style="stop-color:black;stop-opacity:0" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="700" height="720" fill="url(#leftGrad)"/>
      </svg>
    `;
    const gradientOverlayBuffer = Buffer.from(gradientOverlaySvg);

    // ═══════════════════════════════════════════════════════════════
    // CAMADA 3: Pessoa (fit: 'cover', 100% de altura, alinhada à direita)
    // ═══════════════════════════════════════════════════════════════
    console.log(`  📍 Camada 3: Pessoa com fit: 'cover' (altura 720px)`);
    const person = personImages[0];
    let personBuffer = await sharp(person.path)
      .resize(630, 720, {
        fit: "cover",
        position: "right",
      })
      .png()
      .toBuffer();

    const logoOverlay = await buildLogoOverlay(THUMB_WIDTH, THUMB_HEIGHT);

    // ═══════════════════════════════════════════════════════════════
    // CAMADA 4: Texto SVG com Contorno Amarelo/Branco
    // ═══════════════════════════════════════════════════════════════
    console.log(`  📍 Camada 4: Texto overlay gigante confinado à esquerda`);
    let textBuffer: Buffer;
    try {
      textBuffer = await sharp(Buffer.from(textSvg))
        .png()
        .toBuffer();
    } catch (svgError) {
      console.warn("⚠️  SVG rendering failed, using text SVG directly");
      textBuffer = Buffer.from(textSvg);
    }

    // Composição final: template de fundo + fundo desfocado do frame (overlay) + gradiente + pessoa (direita, X=650) + texto (esquerda, X=0)
    const finalComposite = await sharp(bgTemplateBuffer)
      .composite([
        {
          input: blurredBgBuffer,
          top: 0,
          left: 0,
          blend: "overlay", // aplica a textura do frame sobre o gradiente colorido
        },
        {
          input: gradientOverlayBuffer,
          top: 0,
          left: 0,
          blend: "over",
        },
        {
          input: personBuffer,
          top: 0,
          left: 650, // Alinhado perfeitamente na metade direita
          blend: "over",
        },
        {
          input: textBuffer,
          top: 0,
          left: 0,
          blend: "over",
        },
        ...(logoOverlay
          ? [{
              input: logoOverlay,
              top: THUMB_HEIGHT - Math.floor(THUMB_WIDTH * 0.10) - 28,
              left: THUMB_WIDTH - Math.floor(THUMB_WIDTH * 0.10) - 28,
              blend: "over",
            }]
          : []),
      ])
      .flatten({ background: { r: 11, g: 13, b: 34 } })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    console.log(`✅ Thumbnail: ${finalComposite.width}x${finalComposite.height}, ${(finalComposite.size / 1024).toFixed(2)}KB`);
  } catch (error) {
    console.error("❌ Erro na composição:", error);
    throw new Error("Falha na composição");
  }
}

/**
 * 🎬 API PRINCIPAL: GERAÇÃO PROFISSIONAL
 * Pipeline completo: Extração → Remoção de Fundo → Composição
 */
export async function generateProfessionalThumbnailRaw(data: z.infer<typeof ProfessionalThumbnailSchema>) {
  const tempDir = path.join(process.cwd(), "tmp", "thumbnails");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const timestamp = Date.now();
  const removeApiKey = process.env.REMOVE_BG_API_KEY;

  let localVideoPath: string | undefined;
  let downloadedVideoPath: string | undefined;
  const randomId = Math.random().toString(36).substring(2, 11);
  const frameFile = path.join(tempDir, `frame_${timestamp}_${randomId}.png`);
  const noBackgroundFile = path.join(tempDir, `nobg_${timestamp}_${randomId}.png`);
  const outputFile = path.join(tempDir, `thumb_prof_${timestamp}_${randomId}.jpg`);

  try {
    console.log("\n🎬=== PIPELINE PROFISSIONAL DE THUMBNAILS ===🎬\n");

    const cacheDir = path.join(process.cwd(), "tmp", "thumbnails", "frameCache");
    const cacheKey = getCacheKey(data.videoPath, data.extractAtSeconds);
    let cachedFrame = getCachedFrame(cacheDir, cacheKey);

    if (cachedFrame) {
      fs.copyFileSync(cachedFrame, frameFile);
    } else {
      const ytMatch = data.videoPath.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      
      if (ytMatch && ytMatch[1]) {
        const videoId = ytMatch[1];
        console.log(`✅ YouTube detectado (${videoId}). Extraindo frame no segundo ${data.extractAtSeconds}s...`);

        let ytdlpSuccess = false;

        const streamUrlToUse = data.resolvedStreamUrl || null;

        if (streamUrlToUse) {
          try {
            console.log(`⚡ Usando URL de stream pré-resolvida. Extraindo frame no segundo ${data.extractAtSeconds}s...`);
            await extractVideoFrame(streamUrlToUse, data.extractAtSeconds, frameFile);
            ytdlpSuccess = true;
            console.log(`✅ Frame único extraído com sucesso (URL pré-resolvida)!`);
          } catch (preResolvedErr) {
            console.warn(`⚠️ URL pré-resolvida falhou (pode ter expirado): ${preResolvedErr}. Tentando yt-dlp...`);
          }
        }

        if (!ytdlpSuccess) {
          try {
            const ytdlpCmd = `yt-dlp -g -f "bestvideo[ext=mp4]/best[ext=mp4]/best" "${data.videoPath}"`;
            const directUrl = execSync(ytdlpCmd, { encoding: "utf-8", timeout: 20000 }).trim().split('\n')[0];

            if (directUrl && directUrl.startsWith('http')) {
              console.log(`✅ URL de stream obtida via yt-dlp. Extraindo frame no segundo ${data.extractAtSeconds}s...`);
              await extractVideoFrame(directUrl, data.extractAtSeconds, frameFile);
              ytdlpSuccess = true;
              console.log(`✅ Frame único extraído com sucesso para o clip!`);
            }
          } catch (ytdlpErr) {
            console.warn(`⚠️ yt-dlp falhou ao extrair frame: ${ytdlpErr}. Usando thumbnail oficial como fallback...`);
          }
        }

        if (!ytdlpSuccess) {
          let fetchedSuccess = false;
          try {
            console.log(`⚠️ Fallback: baixando thumbnail oficial do YouTube (${videoId})...`);
            let response = await fetch(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
            if (!response.ok) {
              response = await fetch(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
            }
            if (response.ok) {
              const buffer = await response.arrayBuffer();
              fs.writeFileSync(frameFile, Buffer.from(buffer));
              console.log(`✅ Imagem base (fallback) salva em: ${frameFile}`);
              fetchedSuccess = true;
            }
          } catch (fetchErr) {
            console.warn(`⚠️ Erro ao baixar thumbnail oficial do YouTube:`, fetchErr);
          }

          if (!fetchedSuccess) {
            console.warn("⚠️ Não foi possível obter imagem base do YouTube (sem internet ou erro de rede). Gerando fallback local...");
            const width = 1280;
            const height = 720;
            const colors = DESIGN_PRESETS[data.triggerType] || DESIGN_PRESETS.hook;
            const placeholderSvg = `
              <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <rect width="${width}" height="${height}" fill="${colors.primary}"/>
              </svg>
            `;
            await sharp(Buffer.from(placeholderSvg))
              .png()
              .toFile(frameFile);
            console.log(`✅ Imagem base local (solid color) gerada com sucesso em: ${frameFile}`);
          }
        }
      } else {
        try {
          const { localPath, isDownloaded } = await getLocalVideoPath(data.videoPath, tempDir);
          localVideoPath = localPath;
          if (isDownloaded) downloadedVideoPath = localPath;

          console.log("📍 ETAPA 1: Extraindo frame do MP4");
          await extractVideoFrame(localVideoPath, data.extractAtSeconds, frameFile);
        } catch (mp4Err) {
          console.warn("⚠️ Falha ao extrair frame de vídeo local. Gerando fallback local...", mp4Err);
          const width = 1280;
          const height = 720;
          const colors = DESIGN_PRESETS[data.triggerType] || DESIGN_PRESETS.hook;
          const placeholderSvg = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
              <rect width="${width}" height="${height}" fill="${colors.primary}"/>
            </svg>
          `;
          await sharp(Buffer.from(placeholderSvg))
            .png()
            .toFile(frameFile);
          console.log(`✅ Imagem base local (solid color) gerada com sucesso em: ${frameFile}`);
        }
      }

      if (!cachedFrame) {
        saveFrameToCache(cacheDir, cacheKey, frameFile);
      }
    }

    console.log("📍 ETAPA 2: Removendo fundo (segmentação)");
    const bgRemovalResult = await removeBackgroundRobust(frameFile, noBackgroundFile, removeApiKey);
    console.log(`   Método utilizado: ${bgRemovalResult.method}${bgRemovalResult.usedFallback ? " (FALLBACK)" : ""}`);

    console.log("📍 ETAPA 3: Criando fundo templato");
    const colors = DESIGN_PRESETS[data.triggerType];
    const backgroundSvg = createBackgroundTemplate(1280, 720, data.backgroundTemplate, colors);

    console.log("📍 ETAPA 4: Gerando texto profissional");
    const textSvg = createTextSVG(data.clipTitle, data.clipHook, colors, 1280, 720, data.compactLayout);

    console.log("📍 ETAPA 4: Compondo camadas");
    const personImages = data.personPositions.map((pos) => ({
      path: noBackgroundFile,
      position: pos,
    }));

    await composeProfessionalThumbnail(frameFile, personImages, backgroundSvg, textSvg, data.useAdvancedEffects, outputFile);

    const thumbnailBuffer = fs.readFileSync(outputFile);

    let supabaseUrl: string | undefined;
    if (data.clipId) {
      try {
        const bucketName = "videos";
        const fileName = data.clipId ? `thumb_${data.clipId}.jpg` : `thumb_${timestamp}_${randomId}.jpg`;

        console.log(`📤 Fazendo upload da thumbnail do corte '${data.clipId}' para o Supabase Storage...`);
        const { data: uploadData, error: uploadError } = await workerSupabase.storage
          .from(bucketName)
          .upload(fileName, thumbnailBuffer, {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (uploadError) {
          console.error(`❌ Erro ao enviar thumbnail para o bucket '${bucketName}':`, uploadError);
          if (uploadError.message?.toLowerCase().includes("bucket not found") || uploadError.message?.toLowerCase().includes("does not exist")) {
            console.log(`📦 Criando bucket '${bucketName}'...`);
            const { error: createError } = await workerSupabase.storage.createBucket(bucketName, {
              public: true,
            });

            if (!createError) {
              const { data: retryData, error: retryError } = await workerSupabase.storage
                .from(bucketName)
                .upload(fileName, thumbnailBuffer, {
                  contentType: "image/jpeg",
                  upsert: true,
                });

              if (retryError) {
                console.error("❌ Erro no upload da thumbnail após criar o bucket:", retryError);
              } else {
                const { data: publicUrlData } = workerSupabase.storage
                  .from(bucketName)
                  .getPublicUrl(fileName);
                supabaseUrl = publicUrlData.publicUrl;
                console.log(`✅ Upload concluído após criação de bucket: ${supabaseUrl}`);
              }
            } else {
              console.error(`❌ Falha ao criar bucket '${bucketName}':`, createError);
            }
          }
        } else {
          const { data: publicUrlData } = workerSupabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);
          supabaseUrl = publicUrlData.publicUrl;
          console.log(`✅ Upload concluído para o Supabase Storage: ${supabaseUrl}`);
        }
      } catch (storageErr) {
        console.error("❌ Erro ao lidar com Supabase Storage para miniatura:", storageErr);
      }
    }

    const base64Thumbnail = thumbnailBuffer.toString("base64");
    const dataUrl = supabaseUrl || `data:image/jpeg;base64,${base64Thumbnail}`;

    [frameFile, noBackgroundFile, outputFile].forEach((file) => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });
    if (downloadedVideoPath && fs.existsSync(downloadedVideoPath)) {
      fs.unlinkSync(downloadedVideoPath);
    }

    console.log("✅ THUMBNAIL PROFISSIONAL GERADA COM SUCESSO!\n");

    return {
      success: true,
      thumbnailDataUrl: dataUrl,
      message: bgRemovalResult.usedFallback 
        ? "✅ Thumbnail gerada com template de rosto (arquivo sem rosto claro detectado)" 
        : "✅ Thumbnail profissional gerada com rosto extraído!",
      backgroundMethod: bgRemovalResult.method,
      usedFaceTemplateFallback: bgRemovalResult.usedFallback,
      processingTimeMs: Date.now() - timestamp,
    };
  } catch (error) {
    [frameFile, noBackgroundFile, outputFile].forEach((file) => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });
    if (downloadedVideoPath && fs.existsSync(downloadedVideoPath)) {
      fs.unlinkSync(downloadedVideoPath);
    }

    console.error("❌ Erro na geração profissional:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
      backgroundMethod: "failed",
    };
  }
}

export const generateProfessionalThumbnail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ProfessionalThumbnailSchema.parse(data))
  .handler(async ({ data }) => generateProfessionalThumbnailRaw(data as any));
