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
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — KashmirBot" },
      { name: "description", content: "Sign in to KashmirBot with your Google account." },
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

function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      const { data, error } = await supabase.auth.getUser();
      if (!cancelled) {
        if (data.user && !error) {
          router.navigate({ to: "/", replace: true });
        }
        setIsCheckingSession(false);
      }
    }

    checkSession();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleGoogleSignIn() {
    setIsLoading(true);

    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });

    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      setIsLoading(false);
      return;
    }

    if (result.redirected) {
      // Browser is navigating to Google's consent screen; spinner stays visible.
      return;
    }

    // Tokens received in the preview iframe; session already set by the lovable helper.
    toast.success("Signed in successfully");
    router.navigate({ to: "/", replace: true });
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-2xl text-primary-foreground shadow-sm">
            🤖
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Welcome to KashmirBot
          </CardTitle>
          <CardDescription>
            Sign in to save your chat sessions and pick up where you left off.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Signing in…
              </>
            ) : (
              <>
                <GoogleIcon className="mr-2 h-5 w-5" />
                Continue with Google
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
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
