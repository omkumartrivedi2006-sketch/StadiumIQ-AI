import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="w-full max-w-lg p-8 bg-card border border-border shadow-xl rounded-2xl text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse" />
                <AlertTriangle className="relative h-16 w-16 text-red-500" />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-foreground mb-2">500</h1>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Unexpected Application Error
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We encountered a temporary technical glitch. Please try reloading the page.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transition-all btn-press cursor-pointer"
            >
              <RotateCcw size={16} />
              Reload Application
            </button>

            {this.state.error && (
              <details className="mt-6 text-left w-full border border-border rounded-lg bg-slate-50 overflow-hidden">
                <summary className="text-[11px] font-bold text-muted-foreground hover:text-foreground cursor-pointer p-2.5 bg-slate-100 select-none">
                  Show Technical Stacktrace
                </summary>
                <div className="p-3 max-h-40 overflow-y-auto border-t border-border">
                  <pre className="text-[10px] font-mono text-muted-foreground whitespace-pre-wrap leading-normal">
                    {this.state.error.stack || this.state.error.message}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
