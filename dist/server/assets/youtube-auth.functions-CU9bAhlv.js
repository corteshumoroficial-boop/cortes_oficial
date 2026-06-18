const DEFAULT_GOOGLE_CLIENT_ID = "60097047397-pkr5gq70r5r2h1hv01556eivnbaqd07h.apps.googleusercontent.com";
function getGoogleClientId() {
  const configured = ((typeof import.meta !== "undefined" ? "60097047397-pkr5gq70r5r2h1hv01556eivnbaqd07h.apps.googleusercontent.com" : process.env.VITE_GOOGLE_CLIENT_ID) || process.env.GOOGLE_CLIENT_ID || "").trim();
  if (!configured || configured === "test-client-id") {
    return DEFAULT_GOOGLE_CLIENT_ID;
  }
  return configured;
}
function normalizeLocalOrigin(origin) {
  if (!origin) return void 0;
  try {
    const url = new URL(origin);
    if (url.hostname === "localhost" || url.hostname === "[::1]" || url.hostname === "::1") {
      url.hostname = "127.0.0.1";
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    return origin.replace(/\/$/, "");
  }
}
function resolveOAuthRedirectUri(origin) {
  const normalizedOrigin = normalizeLocalOrigin(origin);
  if (normalizedOrigin) {
    return `${normalizedOrigin.replace(/\/$/, "")}/youtube-callback`;
  }
  if (process.env.VITE_GOOGLE_REDIRECT_URI) {
    return process.env.VITE_GOOGLE_REDIRECT_URI;
  }
  return "https://hook-hustle-engine.lovable.app/youtube-callback";
}
export {
  getGoogleClientId as g,
  resolveOAuthRedirectUri as r
};
