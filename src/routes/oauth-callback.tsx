import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/integrations/supabase/client";
import { takePostAuthPath } from "@/lib/oauth";
import ChinarLoader from "@/components/ChinarLoader";

export const Route = createFileRoute("/oauth-callback")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Signing you in — KashmirBot" },
      { name: "description", content: "Completing your KashmirBot sign-in securely." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Signing you in — KashmirBot" },
      { property: "og:description", content: "Completing your KashmirBot sign-in securely." },
    ],
  }),
  component: OAuthCallback,
});

function OAuthCallback() {
  const [message, setMessage] = useState("Finishing sign-in…");

  useEffect(() => {
    let cancelled = false;
    const client = getSupabaseClient();
    const finish = () => {
      if (cancelled) return;
      window.location.replace(takePostAuthPath());
    };

    if (!client) {
      finish();
      return;
    }

    // The Supabase client picks the session up from the callback URL; poll
    // briefly so slow hydration can't strand the user on this screen.
    let tries = 0;
    const tick = async () => {
      const { data } = await client.auth.getSession();
      if (data.session || tries++ > 20) return finish();
      if (tries === 10) setMessage("Almost there…");
      setTimeout(tick, 250);
    };
    void tick();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <ChinarLoader size={56} />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
