import { createServerFn } from "@tanstack/react-start";

/**
 * Validates the YouTube refresh token stored in .env
 * Returns { valid: true } if token works, { valid: false, reason } if expired/revoked
 */
export const checkYoutubeToken = createServerFn({ method: "POST" }).handler(async () => {
  const clientId = (
    process.env.YOUTUBE_CLIENT_ID ||
    process.env.GOOGLE_CLIENT_ID ||
    process.env.VITE_GOOGLE_CLIENT_ID ||
    ""
  ).trim();

  const clientSecret = (
    process.env.YOUTUBE_CLIENT_SECRET ||
    process.env.GOOGLE_CLIENT_SECRET ||
    ""
  ).trim();

  const refreshToken = (process.env.YOUTUBE_REFRESH_TOKEN || "").trim();

  if (!clientId || !clientSecret || !refreshToken) {
    return {
      valid: false as const,
      configured: false as const,
      reason: "YOUTUBE_REFRESH_TOKEN, YOUTUBE_CLIENT_ID ou YOUTUBE_CLIENT_SECRET não configurados no .env.",
    };
  }

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    const json = await response.json() as { access_token?: string; error?: string; error_description?: string };

    if (!response.ok || !json.access_token) {
      const reason = json.error === "invalid_grant"
        ? "O YOUTUBE_REFRESH_TOKEN expirou ou foi revogado. Reconecte sua conta do Google."
        : json.error_description || json.error || "Token inválido.";
      return { valid: false as const, configured: true as const, reason };
    }

    return { valid: true as const, configured: true as const, reason: null };
  } catch (err) {
    return {
      valid: false as const,
      configured: true as const,
      reason: err instanceof Error ? err.message : "Erro ao validar o token.",
    };
  }
});
