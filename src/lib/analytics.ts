const GA_ID = "G-16CJ7CBJX5";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", event, {
    send_to: GA_ID,
    quiz_version: "numerology_v2",
    ...params,
  });
}
