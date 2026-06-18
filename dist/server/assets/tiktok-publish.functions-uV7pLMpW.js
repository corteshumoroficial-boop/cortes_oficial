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
const publishJobToTiktok_createServerFn_handler = createServerRpc({
  id: "f4693f7df910dfe4afb9e936a829260c5518a100a32a6ff884fa14531961bcc5",
  name: "publishJobToTiktok",
  filename: "src/lib/tiktok-publish.functions.ts"
}, (opts) => publishJobToTiktok.__executeServer(opts));
const publishJobToTiktok = createServerFn({
  method: "POST"
}).inputValidator((data) => PublishTiktokJobInput.parse(data)).handler(publishJobToTiktok_createServerFn_handler, async ({
  data
}) => {
  const {
    jobId,
    clipIndex,
    tiktokConfig
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
    const instructionsObj = {
      ...tiktokConfig,
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
        error: "Falha ao registrar solicitação de publicação no TikTok."
      };
    }
    return {
      ok: true,
      message: "Solicitação de publicação no TikTok registrada. O worker irá abrir o Creator Studio em breve."
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao publicar no TikTok."
    };
  }
});
export {
  publishJobToTiktok_createServerFn_handler
};
