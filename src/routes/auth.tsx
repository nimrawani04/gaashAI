import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { enterGuestMode, exitGuestMode } from "@/lib/guest";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — KashmirBot" },
      { name: "description", content: "Sign in to KashmirBot with your Google account or email." },
    ],
  }),
});

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={
        "h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent " +
        (className ?? "")
      }
    />
  );
}

type Mode = "signin" | "signup";

function AuthPage() {
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    let cancelled = false;
    // Never let the session check strand the page on a spinner.
    const failsafe = setTimeout(() => {
      if (!cancelled) setIsCheckingSession(false);
    }, 5000);
    (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (cancelled) return;
        if (data.user && !error) {
          exitGuestMode();
          router.navigate({ to: "/", replace: true });
        }
      } catch {
        /* offline or backend unavailable — still show the form */
      } finally {
        if (!cancelled) setIsCheckingSession(false);
      }
    })();
    return () => {
      cancelled = true;
      clearTimeout(failsafe);
    };
  }, [router]);

  function handleContinueAsGuest() {
    enterGuestMode();
    router.navigate({ to: "/", replace: true });
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    try {
      // Always return to the current origin so localhost signs back into
      // localhost and production into production.
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Google sign-in failed. Please try again.");
        setIsGoogleLoading(false);
        return;
      }
      if (result.redirected) return;
      exitGuestMode();
      toast.success("Signed in successfully");
      router.navigate({ to: "/", replace: true });
    } catch {
      toast.error("Google sign-in is unavailable right now.");
      setIsGoogleLoading(false);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Enter your email and password.");
      return;
    }
    setIsEmailLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error(error.message);
          return;
        }
        exitGuestMode();
        toast.success("Signed in successfully");
        router.navigate({ to: "/", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        if (data.session) {
          exitGuestMode();
          toast.success("Account created");
          router.navigate({ to: "/", replace: true });
        } else {
          toast.success("Check your email to confirm your account.");
        }
      }
    } finally {
      setIsEmailLoading(false);
    }
  }

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </main>
    );
  }

  const busy = isGoogleLoading || isEmailLoading;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-3 xs:px-4 sm:px-6 py-6 xs:py-8 sm:py-10">
      <Card className="w-full max-w-[340px] xs:max-w-sm sm:max-w-md">
        <CardHeader className="space-y-1 text-center px-4 xs:px-6 pt-4 xs:pt-6">
          <div className="mx-auto mb-3 xs:mb-4 flex h-10 w-10 xs:h-12 xs:w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-primary text-xl xs:text-2xl sm:text-3xl text-primary-foreground shadow-sm">
            🤖
          </div>
          <CardTitle className="text-xl xs:text-2xl sm:text-3xl font-semibold tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </CardTitle>
          <CardDescription className="text-xs xs:text-sm">
            {mode === "signin"
              ? "Sign in to pick up where you left off."
              : "Sign up to save your chat sessions."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 xs:space-y-4 px-4 xs:px-6 pb-4 xs:pb-6">
          <Button
            variant="outline"
            className="w-full text-sm xs:text-base"
            size="lg"
            onClick={handleGoogleSignIn}
            disabled={busy}
          >
            {isGoogleLoading ? (
              <>
                <Spinner className="mr-2" />
                Signing in…
              </>
            ) : (
              <>
                <GoogleIcon className="mr-2 h-4 w-4 xs:h-5 xs:w-5" />
                Continue with Google
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[10px] xs:text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-2.5 xs:space-y-3">
            <div className="space-y-1 xs:space-y-1.5">
              <Label htmlFor="email" className="text-xs xs:text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                required
                className="text-sm xs:text-base h-9 xs:h-10"
              />
            </div>
            <div className="space-y-1 xs:space-y-1.5">
              <Label htmlFor="password" className="text-xs xs:text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
                minLength={6}
                required
                className="text-sm xs:text-base h-9 xs:h-10"
              />
            </div>
            <Button type="submit" className="w-full text-sm xs:text-base" size="lg" disabled={busy}>
              {isEmailLoading ? (
                <>
                  <Spinner className="mr-2" />
                  {mode === "signin" ? "Signing in…" : "Creating account…"}
                </>
              ) : mode === "signin" ? (
                "Sign in with email"
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <p className="text-center text-xs xs:text-sm text-muted-foreground">
            {mode === "signin" ? "No account?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              disabled={busy}
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-sm xs:text-base"
            onClick={handleContinueAsGuest}
            disabled={busy}
          >
            Continue as guest
          </Button>

          <p className="text-center text-[10px] xs:text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link
              to="/"
              className="underline underline-offset-2 transition-colors hover:text-foreground"
            >
              Terms of Service
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
