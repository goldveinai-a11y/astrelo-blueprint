import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ReportView, type Tier, type GeneratedNarrative } from "@/components/report/ReportView";
import { buildReport } from "@/lib/report/buildReport";

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

export const Route = createFileRoute("/report/$token")({
  head: () => ({
    meta: [
      { title: "Your Numerology Blueprint — Astrelo" },
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
    const message =
      data && "status" in data && data.status === "generating"
        ? "Preparing your personal blueprint…"
        : "Almost there… Your payment is being confirmed.";
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy px-4 text-center text-white/80">
        <p>{message}</p>
      </div>
    );
  }

  if ("status" in data && data.status === "ready") {
    const report = buildReport({ fullName: data.fullName, dob: data.dob });
    return (
      <ReportView
        report={report}
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
