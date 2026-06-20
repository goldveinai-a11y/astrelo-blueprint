import { createFileRoute } from "@tanstack/react-router";
import { Quiz } from "@/components/quiz/Quiz";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Astrelo — Decode Your Numerology Blueprint" },
      { name: "description", content: "Unlock the hidden mathematical sequence of your birth date. A 25-step numerology quiz revealing your wealth code, karmic debt, and life-path blueprint." },
      { property: "og:title", content: "Astrelo — Decode Your Numerology Blueprint" },
      { property: "og:description", content: "Decode your birth date. Unlock your financial potential and clear karmic blocks with a personalised Numerology Blueprint." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "/" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Quiz />
      <Toaster />
    </>
  );
}
