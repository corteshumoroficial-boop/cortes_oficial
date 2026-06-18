import { c as createServerRpc } from "./createServerRpc-PUFeqlUR.js";
import { a as createServerFn } from "./server-BFBebUZd.js";
import { z } from "zod";
import { w as workerSupabase } from "./worker-supabase.server--3kYC13u.js";
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
const admin = workerSupabase;
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
const publishJobToYoutube_createServerFn_handler = createServerRpc({
  id: "a772e898e4752953c72fd24d5e65fc648263137c3fc4c7f0226f371412ac8fcc",
  name: "publishJobToYoutube",
  filename: "src/lib/youtube-publish.functions.ts"
}, (opts) => publishJobToYoutube.__executeServer(opts));
const publishJobToYoutube = createServerFn({
  method: "POST"
}).inputValidator((data) => PublishJobInput.parse(data)).handler(publishJobToYoutube_createServerFn_handler, async ({
  data
}) => {
  const {
    jobId,
    clipIndex,
    youtubeConfig
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
    if (jobData.status === "published_requested") {
      return {
        ok: true,
        message: "A publicação já foi solicitada e está aguardando o worker local."
      };
    }
    if (jobData.status !== "done" && jobData.status !== "completed" && jobData.status !== "failed") {
      return {
        ok: false,
        error: `Job ainda não foi concluído. Status atual: ${jobData.status}`
      };
    }
    const clipItems = Array.isArray(jobData.clip_items) ? jobData.clip_items : [];
    if (clipIndex !== void 0 && clipItems[clipIndex] && clipItems[clipIndex].youtube_url) {
      return {
        ok: true,
        message: "Este clipe já foi publicado no YouTube.",
        youtubeUrl: clipItems[clipIndex].youtube_url
      };
    }
    const instructionsObj = youtubeConfig ? {
      ...youtubeConfig,
      clip_index: clipIndex
    } : {
      clip_index: clipIndex
    };
    const updatePayload = {
      status: "published_requested",
      updated_at: (/* @__PURE__ */ new Date()).toISOString(),
      error_message: null,
      instructions: JSON.stringify(instructionsObj)
    };
    const {
      error: updateError
    } = await admin.from("render_jobs").update(updatePayload).eq("id", jobId);
    if (updateError) {
      return {
        ok: false,
        error: "Falha ao registrar solicitação de publicação."
      };
    }
    return {
      ok: true,
      message: "Solicitação de publicação registrada. O worker irá processar em breve."
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao publicar no YouTube."
    };
  }
});
export {
  publishJobToYoutube_createServerFn_handler
};
