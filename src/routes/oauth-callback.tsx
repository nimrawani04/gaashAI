import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/integrations/supabase/client";
import {
  clearNativeReturn,
  isNativeReturnPending,
  NATIVE_RETURN_URL,
  takePostAuthPath,
} from "@/lib/oauth";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OAuthCallback,
});

function OAuthCallback() {
  const [message, setMessage] = useState("Finishing sign-in…");

  useEffect(() => {
    let cancelled = false;
    const client = getSupabaseClient();
    const finish = (session?: { access_token: string; refresh_token: string } | null) => {
      if (cancelled) return;
      if (session && isNativeReturnPending()) {
        // Hand the session back to the phone app, which opened this browser.
        clearNativeReturn();
        const hash = new URLSearchParams({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        }).toString();
        setMessage("Returning to KashmirBot…");
        window.location.replace(`${NATIVE_RETURN_URL}#${hash}`);
        return;
      }
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
      if (data.session || tries++ > 20) return finish(data.session);
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
