import { Component, type ErrorInfo, type ReactNode } from "react";
import { reportLovableError } from "@/lib/lovable-error-reporting";

type Props = { children: ReactNode };
type State = { error: Error | null };

/** Keeps a render error in one screen from blanking the whole app. */
export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportLovableError(error, { componentStack: info.componentStack });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <h1 className="font-nastaliq text-2xl text-foreground">کہٕنہٕ گڑبڑ گیہ</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Something went wrong while loading this screen. Please try again.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            className="rounded-full bg-primary px-5 py-2 text-primary-foreground"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
          <button
            className="rounded-full border border-border px-5 py-2 text-foreground"
            onClick={() => window.location.reload()}
          >
            Reload app
          </button>
        </div>
      </div>
    );
  }
}
