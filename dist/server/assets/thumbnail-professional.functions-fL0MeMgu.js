import { c as createSsrRpc } from "./createSsrRpc-CkdUDiOt.js";
import { a as createServerFn } from "./server-BFBebUZd.js";
import { z } from "zod";
import "sharp";
import * as path from "path";
process.env.THUMBNAIL_LOGO_PATH || path.join(process.cwd(), "public", "logo-thumb.png");
const ProfessionalThumbnailSchema = z.object({
  videoPath: z.string().min(1),
  // Local path OU URL remota
  resolvedStreamUrl: z.string().optional(),
  // URL de stream já resolvida (evita chamar yt-dlp por thumbnail)
  clipTitle: z.string().min(1).max(500),
  clipHook: z.string().min(1).max(1e3),
  triggerType: z.enum(["humor", "controversy", "emotional", "hook", "high_value", "cliffhanger"]),
  extractAtSeconds: z.number().optional().default(2),
  personPositions: z.array(z.enum(["left", "center", "right"])).optional().default(["center"]),
  backgroundTemplate: z.enum(["dark_gradient", "vibrant_gradient", "city_night", "abstract"]).optional().default("dark_gradient"),
  compactLayout: z.boolean().optional().default(false),
  useAdvancedEffects: z.boolean().optional().default(true),
  clipId: z.string().optional()
});
const generateProfessionalThumbnail = createServerFn({
  method: "POST"
}).inputValidator((data) => ProfessionalThumbnailSchema.parse(data)).handler(createSsrRpc("7a7febfe5685825330a885fa11b9a0883e740a7b0a4d4bc99a4627a6658edb3e"));
export {
  generateProfessionalThumbnail as g
};
