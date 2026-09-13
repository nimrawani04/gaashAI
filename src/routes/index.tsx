import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "KashmirBot — Your Kashmiri Assistant" },
      { name: "description", content: "Chat in Kashmiri, Urdu, or English with KashmirBot, a friendly assistant designed for everyday questions." },
      { property: "og:title", content: "KashmirBot — Your Kashmiri Assistant" },
      { property: "og:description", content: "A warm, accessible chat assistant that speaks Kashmiri, Urdu, and English." },
    ],
  }),
  component: AppShell,
});

