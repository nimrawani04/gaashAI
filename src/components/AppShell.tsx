import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseClient, getSupabaseConfigStatus } from "@/integrations/supabase/client";
import KashmirBot from "@/components/chat/KashmirBot";
import AuthScreen from "@/components/auth/AuthScreen";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import SplashScreen from "@/components/SplashScreen";
import ChinarLoader from "@/components/ChinarLoader";

export default function AppShell() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [splashDone, setSplashDone] = useState(false);
  const [authInitError, setAuthInitError] = useState<string | null>(null);

  const handleSplashDone = useCallback(() => setSplashDone(true), []);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        const config = getSupabaseConfigStatus();
        if (active && !config.configured) {
          setAuthInitError(config.message);
          setLoading(false);
        }
        return;
      }

      supabase.auth
        .getSession()
        .then(({ data }) => {
          if (!active) return;
          setSession(data.session);
          setLoading(false);
        })
        .catch((error) => {
          if (!active) return;
          setAuthInitError(
            error instanceof Error ? error.message : "Supabase session initialization failed.",
          );
          setLoading(false);
        });

      const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
        if (active) setSession(s);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    } catch (error) {
      if (active) {
        setAuthInitError(
          error instanceof Error ? error.message : "Supabase initialization failed.",
        );
        setLoading(false);
      }
    }

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  return (
    <AppErrorBoundary>
      <SplashScreen onDone={handleSplashDone} />
      {loading || !splashDone ? (
        <StartupLoading />
      ) : authInitError ? (
        <StartupConfigError message={authInitError} />
      ) : !session ? (
        <AuthScreen />
      ) : (
        <KashmirBot session={session} />
      )}
    </AppErrorBoundary>
  );
}

function StartupLoading() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-background">
      <ChinarLoader size={56} />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}

function StartupConfigError({ message }: { message: string }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <span className="text-2xl font-semibold">!</span>
      </div>
      <div className="max-w-md">
        <h1 className="text-xl font-semibold text-foreground">App setup is incomplete</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
