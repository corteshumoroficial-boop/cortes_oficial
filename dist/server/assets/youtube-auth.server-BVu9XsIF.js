import { c as createServerRpc } from "./createServerRpc-PUFeqlUR.js";
import { a as createServerFn } from "./server-BFBebUZd.js";
import { z } from "zod";
import { g as getGoogleClientId } from "./youtube-auth.functions-CU9bAhlv.js";
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
const ExchangeCodeInput = z.object({
  code: z.string().min(1),
  redirectUri: z.string().min(1)
});
function getServerCredentials() {
  const clientId = (process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "").trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || process.env.VITE_GOOGLE_CLIENT_SECRET || (typeof import.meta !== "undefined" ? "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" : void 0) || "").trim();
  return {
    clientId: clientId && clientId !== "test-client-id" ? clientId : getGoogleClientId(),
    clientSecret
  };
}
const exchangeYoutubeCode_createServerFn_handler = createServerRpc({
  id: "6b57fea92a564675273186e7443c6e91bfc3019e44d77584f72701acf9c87fac",
  name: "exchangeYoutubeCode",
  filename: "src/lib/youtube-auth.server.ts"
}, (opts) => exchangeYoutubeCode.__executeServer(opts));
const exchangeYoutubeCode = createServerFn({
  method: "POST"
}).inputValidator((data) => ExchangeCodeInput.parse(data)).handler(exchangeYoutubeCode_createServerFn_handler, async ({
  data
}) => {
  const {
    clientId,
    clientSecret
  } = getServerCredentials();
  if (!clientId || !clientSecret) {
    return {
      ok: false,
      error: "Defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no ambiente do servidor antes de iniciar a autenticação do YouTube."
    };
  }
  const body = new URLSearchParams({
    code: data.code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: data.redirectUri,
    grant_type: "authorization_code"
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });
  const json = await response.json();
  if (!response.ok) {
    return {
      ok: false,
      error: json.error_description || json.error || "Falha ao trocar o código do OAuth."
    };
  }
  return {
    ok: true,
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in,
    tokenType: json.token_type,
    scope: json.scope
  };
});
export {
  exchangeYoutubeCode_createServerFn_handler
};
