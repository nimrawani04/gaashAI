import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AlertTriangle, LogIn, UserRound } from "lucide-react";
import { getSupabaseClient, getSupabaseConfigStatus } from "@/integrations/supabase/client";
import KashmirBot from "@/components/chat/KashmirBot";
import AuthScreen from "@/components/auth/AuthScreen";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import SplashScreen from "@/components/SplashScreen";
import ChinarLoader from "@/components/ChinarLoader";
import { enterGuestMode, exitGuestMode, isGuestMode } from "@/lib/guest";

/** Never let session restoration block the UI for longer than this. */
const AUTH_TIMEOUT_MS = 6000;

type AuthState =
  | { status: "loading" }
  | { status: "ready"; session: Session | null }
  | { status: "error"; message: string };

type StartupState = { phase: "splash" | "entry" };

function startupReducer(state: StartupState, event: { type: "SPLASH_COMPLETED" }): StartupState {
  if (event.type === "SPLASH_COMPLETED" && state.phase === "splash") return { phase: "entry" };
  return state;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("auth_timeout")), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

export default function AppShell() {
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });
  const [startup, dispatchStartup] = useReducer(startupReducer, { phase: "splash" });
  const [guest, setGuest] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const initRef = useRef(0);
  // Whether the backend is *configured* — independent of whether restoring an
  // existing session succeeded. A failed/slow restore must never block sign-in.
  const [backendAvailable] = useState(() => getSupabaseConfigStatus().configured);

  const handleSplashDone = useCallback(() => dispatchStartup({ type: "SPLASH_COMPLETED" }), []);

  // Restore guest choice once, on the client only.
  useEffect(() => {
    if (isGuestMode()) setGuest(true);
  }, []);

  // Session restoration — timeboxed, de-duplicated, never fatal.
  useEffect(() => {
    const runId = ++initRef.current;
    let active = true;
    setAuth({ status: "loading" });

    const client = getSupabaseClient();
    if (!client) {
      const status = getSupabaseConfigStatus();
      setAuth({
        status: "error",
        message: status.configured
          ? "The sign-in service is unavailable."
          : "Sign-in is temporarily unavailable because the app configuration is incomplete.",
      });
      return;
    }

    withTimeout(client.auth.getSession(), AUTH_TIMEOUT_MS)
      .then(({ data }) => {
        if (!active || runId !== initRef.current) return;
        setAuth({ status: "ready", session: data.session ?? null });
      })
      .catch(() => {
        if (!active || runId !== initRef.current) return;
        // Restoring a previous session failed — that says nothing about the
        // ability to sign in now. Show the signed-out form, fully usable.
        setAuth({ status: "ready", session: null });
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  // Live session changes (sign in / sign out / token refresh).
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;
    const { data: sub } = client.auth.onAuthStateChange((_event, s) => {
      setAuth({ status: "ready", session: s });
      if (s) {
        exitGuestMode();
        setGuest(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const continueAsGuest = useCallback(() => {
    enterGuestMode();
    setGuest(true);
  }, []);

  const leaveGuest = useCallback(() => {
    exitGuestMode();
    setGuest(false);
  }, []);

  const session = auth.status === "ready" ? auth.session : null;
  const showAuthLoader = auth.status === "loading" && !guest;

  return (
    <AppErrorBoundary>
      {startup.phase === "splash" ? (
        <SplashScreen onDone={handleSplashDone} />
      ) : showAuthLoader ? (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-background px-6 text-center">
          <ChinarLoader size={56} />
          <p className="font-nastaliq text-sm text-muted-foreground">لوڈ گژھان...</p>
          <button
            onClick={continueAsGuest}
            className="mt-2 rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground transition hover:bg-accent"
          >
            Continue as guest
          </button>
        </div>
      ) : session ? (
        <KashmirBot session={session} />
      ) : guest ? (
        <KashmirBot session={null} isGuest onExitGuest={leaveGuest} />
      ) : (
        <div className="min-h-[100dvh] bg-background">
          {auth.status === "error" && (
            <div className="mx-auto flex max-w-md items-start gap-3 px-4 pt-4">
              <div className="flex w-full items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-left">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{auth.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    You can retry, or continue as a guest and sign in later.
                  </p>
                  <button
                    onClick={() => setAttempt((a) => a + 1)}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          <AuthScreen backendAvailable={auth.status !== "error"} />

          <div className="mx-auto max-w-md px-4 pb-10">
            <div className="flex items-center gap-3 py-4">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <button
              onClick={continueAsGuest}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <UserRound className="h-4 w-4" />
              Continue as guest
            </button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Guests can chat and translate, but history isn't saved.
            </p>
          </div>
        </div>
      )}
    </AppErrorBoundary>
  );
}
