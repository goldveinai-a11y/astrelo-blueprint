import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ReportView, type Tier } from "@/components/report/ReportView";
import { buildReport } from "@/lib/report/buildReport";

const searchSchema = z.object({
  name: z.string().optional(),
  m: z.coerce.number().int().min(1).max(12).optional(),
  d: z.coerce.number().int().min(1).max(31).optional(),
  y: z.coerce.number().int().min(1900).max(2100).optional(),
  tier: z.enum(["core", "popular", "ultimate"]).optional(),
  partner: z.string().optional(),
});

export const Route = createFileRoute("/report/preview")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Your Numerology Blueprint — Astrelo" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReportPreview,
});

function ReportPreview() {
  const { name, m, d, y, tier, partner } = Route.useSearch();
  const fullName = name ?? "Sarah Johnson";
  const dob = { month: m ?? 4, day: d ?? 8, year: y ?? 1990 };

  const report = buildReport({ fullName, dob });
  return (
    <ReportView
      report={report}
      tier={(tier ?? "core") as Tier}
      partnerName={partner}
    />
  );
}
