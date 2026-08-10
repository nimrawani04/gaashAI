import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import KashmirBot from "@/components/chat/KashmirBot";
import AuthScreen from "@/components/auth/AuthScreen";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import SplashScreen from "@/components/SplashScreen";
import ChinarLoader from "@/components/ChinarLoader";

export default function AppShell() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashDone = useCallback(() => setSplashDone(true), []);

  useEffect(() => {
    let active = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        setLoading(false);
      })
      .catch(() => active && setLoading(false));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <AppErrorBoundary>
      <SplashScreen onDone={handleSplashDone} />
      {loading || !splashDone ? (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-background">
          <ChinarLoader size={56} />
          <p className="font-nastaliq text-sm text-muted-foreground">لوڈ گژھان...</p>
        </div>
      ) : !session ? (
        <AuthScreen />
      ) : (
        <KashmirBot session={session} />
      )}
    </AppErrorBoundary>
  );
}
