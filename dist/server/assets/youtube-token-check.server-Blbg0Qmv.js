import { c as createServerRpc } from "./createServerRpc-PUFeqlUR.js";
import { a as createServerFn } from "./server-BFBebUZd.js";
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
const checkYoutubeToken_createServerFn_handler = createServerRpc({
  id: "533b9564ef9decebe1e6faa365cc98a04d6788a9782b30938f79b63e289e366c",
  name: "checkYoutubeToken",
  filename: "src/lib/youtube-token-check.server.ts"
}, (opts) => checkYoutubeToken.__executeServer(opts));
const checkYoutubeToken = createServerFn({
  method: "POST"
}).handler(checkYoutubeToken_createServerFn_handler, async () => {
  const clientId = (process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "").trim();
  const clientSecret = (process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || "").trim();
  const refreshToken = (process.env.YOUTUBE_REFRESH_TOKEN || "").trim();
  if (!clientId || !clientSecret || !refreshToken) {
    return {
      valid: false,
      configured: false,
      reason: "YOUTUBE_REFRESH_TOKEN, YOUTUBE_CLIENT_ID ou YOUTUBE_CLIENT_SECRET não configurados no .env."
    };
  }
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token"
      })
    });
    const json = await response.json();
    if (!response.ok || !json.access_token) {
      const reason = json.error === "invalid_grant" ? "O YOUTUBE_REFRESH_TOKEN expirou ou foi revogado. Reconecte sua conta do Google." : json.error_description || json.error || "Token inválido.";
      return {
        valid: false,
        configured: true,
        reason
      };
    }
    return {
      valid: true,
      configured: true,
      reason: null
    };
  } catch (err) {
    return {
      valid: false,
      configured: true,
      reason: err instanceof Error ? err.message : "Erro ao validar o token."
    };
  }
});
export {
  checkYoutubeToken_createServerFn_handler
};
