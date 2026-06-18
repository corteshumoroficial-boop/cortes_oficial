import { c as createServerRpc } from "./createServerRpc-PUFeqlUR.js";
import { a as createServerFn } from "./server-BFBebUZd.js";
import { z } from "zod";
import { w as workerSupabase } from "./worker-supabase.server--3kYC13u.js";
import { g as generateProfessionalThumbnail } from "./thumbnail-professional.functions-fL0MeMgu.js";
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
import "@supabase/supabase-js";
import "./createSsrRpc-CkdUDiOt.js";
import "sharp";
import "path";
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
const admin = workerSupabase;
function formatRenderJobsError(error) {
  const message = error?.message || error?.details || error?.hint || "Falha ao acessar a tabela render_jobs no Supabase.";
  if (typeof message === "string" && message.toLowerCase().includes("could not find the table")) {
    return "Tabela render_jobs não encontrada no Supabase. Execute supabase/render_jobs.sql no seu projeto Supabase.";
  }
  return message;
}
async function maybeEnsureClipThumbnails(clips, videoUrl) {
  const shouldPreRender = (process.env.RENDER_JOB_PREGENERATE_THUMBNAILS || "false").toLowerCase() === "true";
  const clipsNeedingThumbs = clips.filter((c) => !c.thumbnailDataUrl);
  if (!shouldPreRender || clipsNeedingThumbs.length === 0 || !videoUrl) {
    return clips;
  }
  console.log(`📸 Gerando thumbnails para ${clipsNeedingThumbs.length} clipes sem thumb (modo opcional)...`);
  const allTriggerTypes = ["humor", "controversy", "emotional", "hook", "high_value", "cliffhanger"];
  return Promise.all(clips.map(async (clip, index) => {
    if (clip.thumbnailDataUrl) {
      return clip;
    }
    try {
      const selectedTrigger = allTriggerTypes[index % allTriggerTypes.length];
      const timeParts = clip.startTimestamp.split(":").reverse();
      let startSeconds = 0;
      for (let i = 0; i < timeParts.length; i++) {
        startSeconds += (parseInt(timeParts[i], 10) || 0) * Math.pow(60, i);
      }
      const extractAtSeconds = startSeconds + 2;
      const backgroundTemplate = ["dark_gradient", "vibrant_gradient", "abstract"][index % 3];
      const result = await generateProfessionalThumbnail({
        data: {
          videoPath: videoUrl,
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
      return {
        ...clip,
        thumbnailDataUrl: result.success ? result.thumbnailDataUrl : void 0
      };
    } catch (error) {
      console.warn(`⚠️ Thumbnail falhou para "${clip.title}":`, error);
      return clip;
    }
  }));
}
const createRenderJob_createServerFn_handler = createServerRpc({
  id: "3abd7d430233dc5f929d074972ce75e0693a5db085ce21160f3379ffb5783e79",
  name: "createRenderJob",
  filename: "src/lib/render-jobs.functions.ts"
}, (opts) => createRenderJob.__executeServer(opts));
const createRenderJob = createServerFn({
  method: "POST"
}).inputValidator((data) => createRenderJobInput.parse(data)).handler(createRenderJob_createServerFn_handler, async ({
  data
}) => {
  const clipsWithThumbs = await maybeEnsureClipThumbnails(data.clipItems, data.videoUrl);
  const payload = {
    video_url: data.videoUrl,
    video_title: data.videoTitle,
    platform: data.platform,
    render_format: data.renderFormat,
    clip_items: clipsWithThumbs,
    instructions: data.instructions,
    status: "pending",
    requested_by: null
  };
  const response = await admin.from("render_jobs").insert(payload).select("*").single();
  if (response.error) {
    return {
      job: null,
      error: formatRenderJobsError(response.error)
    };
  }
  return {
    job: response.data
  };
});
const listRenderJobs_createServerFn_handler = createServerRpc({
  id: "43051d452bc40d80f7169ad50e22b568c781493cba86d7fe82049b05d789b7ed",
  name: "listRenderJobs",
  filename: "src/lib/render-jobs.functions.ts"
}, (opts) => listRenderJobs.__executeServer(opts));
const listRenderJobs = createServerFn({
  method: "POST"
}).inputValidator((data) => listRenderJobsInput.parse(data)).handler(listRenderJobs_createServerFn_handler, async ({
  data
}) => {
  const response = await admin.from("render_jobs").select("*").order("created_at", {
    ascending: false
  }).limit(data.limit);
  if (response.error) {
    return {
      jobs: [],
      error: formatRenderJobsError(response.error)
    };
  }
  return {
    jobs: response.data
  };
});
const clearOldRenderJobs_createServerFn_handler = createServerRpc({
  id: "e073ea43fcaeb40428cb4ac6689ab987e301a12b552cf675eac4473ae7a24af9",
  name: "clearOldRenderJobs",
  filename: "src/lib/render-jobs.functions.ts"
}, (opts) => clearOldRenderJobs.__executeServer(opts));
const clearOldRenderJobs = createServerFn({
  method: "POST"
}).handler(clearOldRenderJobs_createServerFn_handler, async () => {
  const response = await admin.from("render_jobs").delete().in("status", ["done", "completed", "failed"]);
  if (response.error) {
    return {
      ok: false,
      error: formatRenderJobsError(response.error)
    };
  }
  return {
    ok: true
  };
});
const retryRenderJob_createServerFn_handler = createServerRpc({
  id: "449f70060e52faa58d5fed6a4640fba7f0dfbe66286a670e7e719cda5aacc9e7",
  name: "retryRenderJob",
  filename: "src/lib/render-jobs.functions.ts"
}, (opts) => retryRenderJob.__executeServer(opts));
const retryRenderJob = createServerFn({
  method: "POST"
}).inputValidator((data) => z.object({
  jobId: z.string().min(1)
}).parse(data)).handler(retryRenderJob_createServerFn_handler, async ({
  data
}) => {
  const {
    jobId
  } = data;
  try {
    const {
      data: jobData,
      error: fetchError
    } = await admin.from("render_jobs").select("*").eq("id", jobId).single();
    if (fetchError || !jobData) {
      return {
        ok: false,
        error: "Job não encontrado."
      };
    }
    const hasOutputFiles = jobData.output_path && !jobData.output_path.includes("youtube.com") && jobData.output_path.trim().length > 0;
    const newStatus = hasOutputFiles ? "published_requested" : "pending";
    const {
      error: updateError
    } = await admin.from("render_jobs").update({
      status: newStatus,
      updated_at: (/* @__PURE__ */ new Date()).toISOString(),
      error_message: null
    }).eq("id", jobId);
    if (updateError) {
      return {
        ok: false,
        error: "Falha ao reiniciar o job."
      };
    }
    return {
      ok: true,
      message: newStatus === "published_requested" ? "Solicitação de publicação reenviada." : "Job de renderização reiniciado na fila."
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao reiniciar o job."
    };
  }
});
const deleteRenderJob_createServerFn_handler = createServerRpc({
  id: "e7ec4506f640ce4d890b018717de953fcbde25dfa18d402f07ab603b26c73d8d",
  name: "deleteRenderJob",
  filename: "src/lib/render-jobs.functions.ts"
}, (opts) => deleteRenderJob.__executeServer(opts));
const deleteRenderJob = createServerFn({
  method: "POST"
}).inputValidator((data) => z.object({
  jobId: z.string().min(1)
}).parse(data)).handler(deleteRenderJob_createServerFn_handler, async ({
  data
}) => {
  const {
    jobId
  } = data;
  try {
    const {
      error
    } = await admin.from("render_jobs").delete().eq("id", jobId);
    if (error) {
      return {
        ok: false,
        error: "Falha ao excluir o job."
      };
    }
    return {
      ok: true,
      message: "Job excluído com sucesso."
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao excluir o job."
    };
  }
});
const fetchYoutubeThumbnail_createServerFn_handler = createServerRpc({
  id: "6f1cc574e77f5ba11c833fccbd59db03ea1da6ede09fb566f52129afe2e7fab8",
  name: "fetchYoutubeThumbnail",
  filename: "src/lib/render-jobs.functions.ts"
}, (opts) => fetchYoutubeThumbnail.__executeServer(opts));
const fetchYoutubeThumbnail = createServerFn({
  method: "GET"
}).inputValidator((data) => z.object({
  videoId: z.string().min(1)
}).parse(data)).handler(fetchYoutubeThumbnail_createServerFn_handler, async ({
  data
}) => {
  const {
    videoId
  } = data;
  const urls = [`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, `https://img.youtube.com/vi/${videoId}/sddefault.jpg`, `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, `https://img.youtube.com/vi/${videoId}/0.jpg`];
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const contentType = response.headers.get("content-type") || "image/jpeg";
        return {
          dataUrl: `data:${contentType};base64,${base64}`
        };
      }
    } catch (e) {
      console.error(`Error fetching thumbnail from ${url}:`, e);
    }
  }
  return {
    dataUrl: null
  };
});
export {
  clearOldRenderJobs_createServerFn_handler,
  createRenderJob_createServerFn_handler,
  deleteRenderJob_createServerFn_handler,
  fetchYoutubeThumbnail_createServerFn_handler,
  listRenderJobs_createServerFn_handler,
  retryRenderJob_createServerFn_handler
};
