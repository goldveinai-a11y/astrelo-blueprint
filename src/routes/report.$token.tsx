import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ReportView, type Tier, type GeneratedNarrative } from "@/components/report/ReportView";
import { buildReport } from "@/lib/report/buildReport";
import { track } from "@/lib/analytics";
import { TIER_PRICE_USD } from "@/lib/quiz/tiers";

type ApiResponse =
  | { status: "pending" }
  | { status: "generating" }
  | {
      status: "ready";
      fullName: string;
      dob: { day: number; month: number; year: number };
      tier: Tier;
      partnerName?: string | null;
      narrative: GeneratedNarrative;
    }
  | { error: string };

const GENERATING_MESSAGES = [
  "Calculating your core numbers…",
  "Cross-referencing your karmic patterns…",
  "Mapping your energetic windows…",
  "Writing your personal narrative…",
  "Polishing the final details…",
];

function GeneratingMessage() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setI((prev) => (prev + 1) % GENERATING_MESSAGES.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);
  return (
    <p key={i} className="text-sm text-white/40 transition-opacity duration-500">
      {GENERATING_MESSAGES[i]}
    </p>
  );
}

export const Route = createFileRoute("/report/$token")({
  head: () => ({
    meta: [
      { title: "Your Personal Numerology Blueprint Report — Astrelo" },
      { name: "description", content: "Your private, personalised Astrelo numerology blueprint report — generated from your birth date and unique to you." },
      { property: "og:title", content: "Your Personal Numerology Blueprint Report — Astrelo" },
      { property: "og:description", content: "Your private, personalised Astrelo numerology blueprint report — generated from your birth date and unique to you." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { token } = Route.useParams();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const res = await fetch(`/api/public/get-report?token=${encodeURIComponent(token)}`);
        if (res.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }
        const json: ApiResponse = await res.json();
        if (cancelled) return;
        setData(json);
        if ("status" in json && (json.status === "pending" || json.status === "generating")) {
          timer = setTimeout(poll, 1500);
        }
      } catch {
        if (!cancelled) timer = setTimeout(poll, 1500);
      }
    };

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [token]);

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy px-4 text-center text-white/80">
        <p>We couldn't find that report. Double-check the link from your email.</p>
      </div>
    );
  }

  const isWaiting = !data || ("status" in data && (data.status === "pending" || data.status === "generating"));

  if (isWaiting) {
    const isGenerating = data && "status" in data && data.status === "generating";
    const message = isGenerating
      ? "Preparing your personal blueprint…"
      : "Almost there… Your payment is being confirmed.";
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-navy px-4 text-center text-white/80">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
        <p className="text-lg">{message}</p>
        {isGenerating ? <GeneratingMessage /> : <p className="text-sm text-white/40">This usually takes a few seconds.</p>}
      </div>
    );
  }

  if ("status" in data && data.status === "ready") {
    return (
      <ReadyReport
        token={token}
        fullName={data.fullName}
        dob={data.dob}
        tier={data.tier}
        partnerName={data.partnerName ?? undefined}
        narrative={data.narrative}
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4 text-center text-white/80">
      <p>Something went wrong loading your report. Reply to your confirmation email and we'll sort it out.</p>
    </div>
  );
}

function ReadyReport({
  token,
  fullName,
  dob,
  tier,
  partnerName,
  narrative,
}: {
  token: string;
  fullName: string;
  dob: { day: number; month: number; year: number };
  tier: Tier;
  partnerName?: string;
  narrative: GeneratedNarrative;
}) {
  useEffect(() => {
    const key = `ga_purchase_${token}`;
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(key)) return;
    const value = TIER_PRICE_USD[tier];
    track("purchase", {
      transaction_id: token,
      currency: "USD",
      value,
      items: [
        { item_id: tier, item_name: `Numerology Blueprint — ${tier}`, price: value, quantity: 1 },
      ],
    });
    track("view_report", { transaction_id: token, tier });
    window.sessionStorage.setItem(key, "1");
  }, [token, tier]);

  const report = buildReport({ fullName, dob });
  return (
    <ReportView
      report={report}
      tier={tier}
      partnerName={partnerName}
      narrative={narrative}
    />
  );
}
