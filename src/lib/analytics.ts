declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
  }
}

const FB_EVENT_MAP: Record<string, string> = {
  purchase: "Purchase",
  begin_checkout: "InitiateCheckout",
  view_result: "ViewContent",
  generate_lead: "Lead",
};

export function track(event: string, params: Record<string, unknown> = {}) {
  // GA4 / Google Ads
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", event, {
      quiz_version: "numerology_v2",
      ...params,
    });
  }

  // Meta Pixel
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    const fbEvent = FB_EVENT_MAP[event];
    if (fbEvent) {
      const fbParams: Record<string, unknown> = {};
      if (params.value !== undefined) fbParams.value = params.value;
      if (params.currency !== undefined) fbParams.currency = String(params.currency).toUpperCase();
      if (params.transaction_id !== undefined) fbParams.order_id = params.transaction_id;
      if (params.items !== undefined) fbParams.contents = params.items;
      window.fbq("track", fbEvent, fbParams);
    }
  }
}
